import argparse
import os.path
import sys
import boto3
import json
from botocore.exceptions import NoRegionError, ClientError
from flask_login import current_user

def getRDSInstances(rds_region, botoAPI = boto3):
    DBInstances = []
    rds = botoAPI.client('rds', region_name=rds_region,
    aws_access_key_id=current_user.access_key,
    aws_secret_access_key=current_user.secret_key)

    try:
        response = rds.describe_db_instances()
    except ClientError as e:
        return e.response

    DBInstancesInfo = response['DBInstances']

    for instance in DBInstancesInfo:
        DBInstances.append(instance['Endpoint']['Address'])

    return DBInstances

def getS3Instances(botoAPI = boto3):
    S3Instances = []
    s3 = botoAPI.client('s3', aws_access_key_id=current_user.access_key,
    aws_secret_access_key=current_user.secret_key)

    try:
        response = s3.list_buckets()
    except ClientError as e:
        print(e)
        return e.response

    S3InstancesInfo = response['Buckets']
    for instance in S3InstancesInfo:
        S3Instances.append(instance['Name'])

    return S3Instances
