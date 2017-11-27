import boto3
import datetime

def get_metrics():
    client = boto3.client('cloudwatch', 'us-west-1')

    metrics = client.get_metric_statistics(
        Namespace='AWS/RDS',
        MetricName='CPUUtilization',
        Dimensions=[
            {
                'Name': 'DBInstanceIdentifier',
                'Value': 'testcrt'
            },
        ],
        StartTime=datetime.datetime.utcnow() - datetime.timedelta(days=1),
        EndTime=datetime.datetime.utcnow(),
        Period=60,
        Statistics=['Average'],
        Unit='Percent'
        )

    return metrics