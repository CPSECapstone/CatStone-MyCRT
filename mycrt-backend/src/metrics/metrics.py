import boto3
import os.path
from operator import itemgetter
from flask import g
from datetime import date, datetime, timedelta
from botocore.exceptions import ClientError

def save_metrics(alias, start_time, end_time, bucket_name, db_identifier, metric_type, region_name, user):
    metric_file = alias + ".metrics"
    if (type(user)) is dict:
        s3 = boto3.client('s3', aws_access_key_id=user['access_key'],
                          aws_secret_access_key=user['secret_key'])
        client = boto3.client('cloudwatch', aws_access_key_id=user['access_key'],
                              aws_secret_access_key=user['secret_key'], region_name=region_name)
    else:
        s3 = boto3.client('s3', aws_access_key_id=user.access_key,
         aws_secret_access_key=user.secret_key)
        client = boto3.client('cloudwatch', aws_access_key_id=user.access_key,
         aws_secret_access_key=user.secret_key, region_name=region_name)

    if start_time.replace(microsecond=0,second=0) == end_time.replace(microsecond=0,second=0):
        start_time = start_time - timedelta(minutes=4)
        end_time = end_time + timedelta(minutes=4)

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
        Period=calculate_period(start_time, end_time),
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

def calculate_period(start_time, end_time):
    time_delta_seconds = (end_time - start_time).total_seconds()
    period = int(time_delta_seconds / 100)
    if period >= 60:
        return int(round(period/60.0) * 60.0)
    elif period <= 5:
        return 1
    elif period <= 10:
        return 10
    elif period <= 30:
        return 30

def get_metrics(metric_type, metric_alias, bucket_name, start_time, user):
    s3 = boto3.resource('s3', aws_access_key_id=user.access_key,
     aws_secret_access_key=user.secret_key)
    metric_data = []
    time_format = '%Y-%m-%d %H:%M:%S'

    try:
        s3.Bucket(bucket_name).download_file(metric_alias, metric_alias)
    except ClientError as e:
        return e.response

    with open(metric_alias, "r") as f:
        for line in f:
            if metric_type in line:
                datapoint = dict(item.split("=") for item in line.rstrip('\n').split(","))

                parsed_time = datapoint['Timestamp'].split(":")
                datapoint['Timestamp'] = parsed_time[0] + ':'+ parsed_time[1] + ':' + parsed_time[3]

                time_object = datetime.strptime(datapoint['Timestamp'], time_format)

                datapoint['Timestamp'] = str(time_object - start_time)

                if metric_type is 'FreeableMemory':
                    datapoint[metric_type] = float(datapoint[metric_type]) / 1000000

                datapoint[metric_type] = round(float(datapoint[metric_type]), 2)
                metric_data.append(datapoint)

    os.remove(metric_alias)
    return metric_data