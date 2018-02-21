import boto3
from operator import itemgetter
from flask import g

from botocore.exceptions import ClientError

def save_metrics(alias, start_time, end_time, bucket_name, db_identifier, metric_type):
    metric_file = alias + ".metrics"
    s3 = boto3.client('s3', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)
    client = boto3.client('cloudwatch', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)

    metrics = client.get_metric_statistics(
        Namespace='AWS/RDS',
        MetricName=metric_type,
        Dimensions=[
            {
                'Name': 'DBInstanceIdentifier',
                'Value': db_identifier
            },
        ],
        StartTime=start_time,
        EndTime=end_time,
        Period=360,
        Statistics=['Average']
    )
    
    metric_data = []
    sorted_metrics = sorted(metrics['Datapoints'], key=itemgetter('Timestamp'))
    print (sorted_metrics)

    with open(metric_file, "a") as f:

        for datapoint in sorted_metrics:
            datapoint_data = {}

            datapoint_data['Timestamp'] = datapoint['Timestamp']
            datapoint_data[metric_type] = datapoint['Average']

            f.write('Timestamp=' + str(datapoint['Timestamp']) + ',')
            f.write(metric_type + '=' + str(datapoint['Average']) + '\n')

            metric_data.append(datapoint_data)

    try:
        response = s3.upload_file(metric_file, bucket_name, metric_file)
    except ClientError as e:
        return e

    return metric_data

def get_metrics(metric_type, metric_alias, bucket_name):
    s3 = boto3.resource('s3', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)

    try:
        s3.Bucket(bucket_name).download_file(metric_alias, metric_alias)
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise

    metric_data = []

    with open(metric_alias, "r") as f:
        for line in f:
            if metric_type in line:
                datapoint = dict(item.split("=") for item in line.rstrip('\n').split(","))
                metric_data.append(datapoint)

    return metric_data
