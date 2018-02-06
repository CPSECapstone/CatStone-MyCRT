import boto3
import datetime
from operator import itemgetter

from botocore.exceptions import ClientError

def get_all_metrics(local_log_file, start_time, end_time, bucket_name, db_identifier):
    # can remove once attached to capture function because will be passed as parsed datetimes
    start_time = datetime.datetime(2018, 2, 5, 19, 20, 5) - datetime.timedelta(days=1)
    end_time = datetime.datetime(2018, 2, 5, 19, 20, 5)

    local_metric_file = local_log_file + "_metrics"
    all_metrics = {"timestamps": [], "CPUUtilization": [], "ReadIOPS": [], "WriteIOPS": [], "FreeableMemory": []}

    client = boto3.client('cloudwatch')
    s3 = boto3.client('s3')

    all_metrics["timestamps"] = get_timestamps(client, start_time, end_time, db_identifier)
    all_metrics["CPUUtilization"] = get_metric_data(client, "CPUUtilization", start_time, end_time, db_identifier)
    all_metrics["ReadIOPS"] = get_metric_data(client, "ReadIOPS", start_time, end_time, db_identifier)
    all_metrics["WriteIOPS"] = get_metric_data(client, "WriteIOPS", start_time, end_time, db_identifier)
    all_metrics["FreeableMemory"] = get_metric_data(client, "FreeableMemory", start_time, end_time, db_identifier)

    for i in range(0, len(all_metrics["timestamps"])):
        print(all_metrics["timestamps"][i]),
        print(all_metrics["CPUUtilization"][i]),
        print(all_metrics["ReadIOPS"][i]),
        print(all_metrics["WriteIOPS"][i]),
        print(all_metrics["FreeableMemory"][i])

    # Will need to update how data is saved to the file
    #with open(local_metric_file, 'w') as f:
    #        for datapoint in metrics['Datapoints']:
    #            #f.write(str(datapoint) + '\n')
                #print(datapoint)
    #            metrics_list.append(datapoint)



    #try:
    #    response = s3.upload_file(local_metric_file, bucket_name, local_metric_file)
    #except ClientError as e:
    #    return e

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
        Period=60,
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
        Period=60,
        Statistics=['Average']
    )

    sorted_metrics = sorted(metrics['Datapoints'], key=itemgetter('Timestamp'))
    data = []

    for datapoint in sorted_metrics:
        data.append(datapoint['Timestamp'])

    return data


def main():
   get_all_metrics("capture001", None, None, "s3-catstone-capture-test", "rds-catstone-metric-test")

if __name__ == '__main__':
   main()