import boto3
import datetime

#set aws_key_file to the path to your access key and secret_aws_key_file to the path to your secret key
aws_key_file = "ACCESS_KEY_PATH"
secret_aws_key_file = "SECRET_KEY_PATH"
aws_file = open(aws_key_file, "r")
access_key = aws_file.readline()
aws_secret_file = open(secret_aws_key_file, "r")
secret_key = aws_secret_file.readline()


def get_metrics():
    client = boto3.client(
        'cloudwatch',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

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

    print(metrics)


def main():
   get_metrics()

if __name__ == '__main__':
   main()