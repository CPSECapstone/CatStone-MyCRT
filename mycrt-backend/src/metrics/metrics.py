import boto3
import os.path
from operator import itemgetter
from flask import g
from datetime import date, datetime, timedelta
from botocore.exceptions import ClientError

def save_metrics(alias, start_time, end_time, bucket_name, db_identifier, metric_type, region_name, user):
    metric_file = alias + ".metrics"
    s3 = boto3.client('s3', aws_access_key_id=user.access_key,
     aws_secret_access_key=user.secret_key)
    client = boto3.client('cloudwatch', aws_access_key_id=user.access_key,
     aws_secret_access_key=user.secret_key, region_name=region_name)

    identifier = db_identifier.split('.')[0]

    metrics = client.get_metric_statistics(
        Namespace='AWS/RDS',
        MetricName=metric_type,
        Dimensions=[
            {
                'Name': 'DBInstanceIdentifier',
                'Value': identifier
            },
        ],
        StartTime=start_time,
        EndTime=end_time,
        Period=360,
        Statistics=['Average']
    )

    metric_data = []
    sorted_metrics = sorted(metrics['Datapoints'], key=itemgetter('Timestamp'))

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

def get_metrics(metric_type, metric_alias, bucket_name, user):
    s3 = boto3.resource('s3', aws_access_key_id=user.access_key,
     aws_secret_access_key=user.secret_key)

    try:
        s3.Bucket(bucket_name).download_file(metric_alias, metric_alias)
    except ClientError as e:
        return e.response


    metric_data = []

    with open(metric_alias, "r") as f:
        for line in f:
            if metric_type in line:
                datapoint = dict(item.split("=") for item in line.rstrip('\n').split(","))

                parsed_time = datapoint['Timestamp'].split(":")
                datapoint['Timestamp'] = parsed_time[0] + ':'+ parsed_time[1]

                if metric_type is 'FreeableMemory':
                    datapoint[metric_type] = float(datapoint[metric_type]) / 1000000

                datapoint[metric_type] = round(float(datapoint[metric_type]), 2)
                metric_data.append(datapoint)

    return metric_data
