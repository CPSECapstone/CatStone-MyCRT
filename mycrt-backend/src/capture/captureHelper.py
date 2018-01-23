import argparse
import os.path
import sys
import boto3
import json
from botocore.exceptions import NoRegionError, ClientError

#AWS setup
s3 = boto3.client('s3')


def getRDSInstances(botoAPI = boto3):
    DBInstances = []
    rds = botoAPI.client('rds')

    try:
        response = rds.describe_db_instances()
    except ClientError as e:
        return e.response

    DBInstancesInfo = response['DBInstances']
    for instance in DBInstancesInfo:
        DBInstances.append(instance['DBInstanceIdentifier'])

    return DBInstances

def getS3Instances():
    S3Instances = []

    try:
        response = s3.list_buckets()
    except ClientError as e:
        print(e)
        return e.response

    S3InstancesInfo = response['Buckets']
    for instance in S3InstancesInfo:
        S3Instances.append(instance['Name'])

    return S3Instances
