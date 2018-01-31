import boto3
import datetime
from botocore.exceptions import ClientError

def get_metrics(local_log_file, start_time, end_time, bucket_name):
    # can remove once attached to capture function because will be passed as parsed datetimes
    # parsed_start = datetime.strptime(start_time[:-1], "%Y-%m-%dT%H:%M:%S.%f")
    # parsed_end = datetime.strptime(end_time[:-1], "%Y-%m-%dT%H:%M:%S.%f")
    local_metric_file = local_log_file + "_metrics"
    metrics_list = []

    client = boto3.client('cloudwatch')
    s3 = boto3.client('s3')

    metrics = client.get_metric_statistics(
        Namespace='AWS/RDS',
        MetricName='CPUUtilization',
        Dimensions=[
            {
                'Name': 'DBInstanceIdentifier',
                'Value': 'rds-catstone-metric-test'
            },
        ],
        StartTime=datetime.datetime.utcnow() - datetime.timedelta(days=1),
        EndTime=datetime.datetime.utcnow(),
        Period=60,
        Statistics=['Average'],
        Unit='Percent'
    )

    with open(local_metric_file, 'w') as f:
            for datapoint in metrics['Datapoints']:
                f.write(str(datapoint) + '\n')
                metrics_list.append(datapoint)

    try:
        response = s3.upload_file(local_metric_file, bucket_name, local_metric_file)
    except ClientError as e:
        return e

    return metrics_list


def main():
   get_metrics("capture001", None, None, "s3-catstone-capture-test")

if __name__ == '__main__':
   main()