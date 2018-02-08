import boto3
import datetime
from operator import itemgetter

from botocore.exceptions import ClientError

def get_all_metrics(local_log_file, start_time, end_time, bucket_name, db_identifier):
    local_metric_file = local_log_file + "_metrics"
    all_metrics = {"timestamps": [], "CPUUtilization": [], "ReadIOPS": [], "WriteIOPS": [], "FreeableMemory": []}

    client = boto3.client('cloudwatch')
    s3 = boto3.client('s3')

    all_metrics["timestamps"] = get_timestamps(client, start_time, end_time, db_identifier)
    all_metrics["CPUUtilization"] = get_metric_data(client, "CPUUtilization", start_time, end_time, db_identifier)
    all_metrics["ReadIOPS"] = get_metric_data(client, "ReadIOPS", start_time, end_time, db_identifier)
    all_metrics["WriteIOPS"] = get_metric_data(client, "WriteIOPS", start_time, end_time, db_identifier)
    all_metrics["FreeableMemory"] = get_metric_data(client, "FreeableMemory", start_time, end_time, db_identifier)

    with open(local_metric_file, 'w') as f:
        for i in range(0, len(all_metrics["timestamps"])):
            f.write("timestamp: " + str(all_metrics["timestamps"][i]) + '\n')
            f.write("     CPUUtilization: " + str(all_metrics["CPUUtilization"][i]) + " percent\n")
            f.write("     ReadIOPS: " + str(all_metrics["ReadIOPS"][i]) + " count/second\n")
            f.write("     WriteIOPS: " + str(all_metrics["WriteIOPS"][i]) + " count/second\n")
            f.write("     FreeableMemory: " + str(all_metrics["FreeableMemory"][i]) + " bytes\n")


    try:
        response = s3.upload_file(local_metric_file, bucket_name, local_metric_file)
    except ClientError as e:
        return e

    return all_metrics


def get_metric_data(client, metric_name, start_time, end_time, db_identifier):
    metrics = client.get_metric_statistics(
        Namespace='AWS/RDS',
        MetricName=metric_name,
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

    sorted_metrics = sorted(metrics['Datapoints'], key=itemgetter('Timestamp'))
    data = []

    for datapoint in sorted_metrics:
        data.append(datapoint['Average'])

    return data


def get_timestamps(client, start_time, end_time, db_identifier):
    metrics = client.get_metric_statistics(
        Namespace='AWS/RDS',
        MetricName='CPUUtilization',
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

    sorted_metrics = sorted(metrics['Datapoints'], key=itemgetter('Timestamp'))
    data = []

    for datapoint in sorted_metrics:
        data.append(datapoint['Timestamp'])

    return data