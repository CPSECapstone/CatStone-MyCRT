import boto3
import datetime
from operator import itemgetter

from botocore.exceptions import ClientError

def get_metrics(local_log_file, start_time, end_time, bucket_name, db_identifier, metric_type):
    local_metric_file = local_log_file + "_metrics"

    client = boto3.client('cloudwatch')
    s3 = boto3.client('s3')

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


    with open(local_metric_file, "a") as f:

        for datapoint in sorted_metrics:
            datapoint_data = {}

            datapoint_data['Timestamp'] = datapoint['Timestamp']
            datapoint_data[metric_type] = datapoint['Average']

            f.write('Timestamp:' + str(datapoint['Timestamp']) + ',')
            f.write(metric_type + ':' + str(datapoint['Average']) + "\n")

            metric_data.append(datapoint_data)

    try:
        response = s3.upload_file(local_metric_file, bucket_name, local_metric_file)
    except ClientError as e:
        return e

    return metric_data
