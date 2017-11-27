import argparse
import os.path
import sys
import boto3
from botocore.exceptions import NoRegionError, ClientError

#s3 setup
s3 = boto3.client('s3')

def capture(region, rds_instance, log_file, local_log_file, bucket_name):
    try:
        rds = boto3.client('rds', region)
    except NoRegionError:
        rds = boto3.client('rds','us-west-1')

    with open(local_log_file, 'w') as f:
        print('downloading {rds} log file {file}'.format(rds=rds_instance, file=log_file))
        token = '0'
        try:
            response = rds.download_db_log_file_portion(
                DBInstanceIdentifier=rds_instance,
                LogFileName=log_file,
                Marker=token)
            while response['AdditionalDataPending']:
                f.write(response['LogFileData'])
                token=response['Marker']
                response = rds.download_db_log_file_portion(
                    DBInstanceIdentifier=rds_instance,
                    LogFileName=log_file,
                    Marker=token)
            f.write(response['LogFileData'])
        except ClientError as e:
            print(e)
            return 0
    s3.upload_file(local_log_file, bucket_name, local_log_file)
    return 1
