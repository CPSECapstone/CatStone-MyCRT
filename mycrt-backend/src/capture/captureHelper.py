import argparse
import os.path
import sys
import boto3
import json

from botocore.exceptions import NoRegionError, ClientError
from flask import g

def getRDSInstances(region_name, botoAPI = boto3):
    DBInstances = []
    if (g.user == None):
        rds = botoAPI.client('rds')
    else:
        rds = botoAPI.client('rds', region_name=region_name,
        aws_access_key_id=g.user.access_key,
        aws_secret_access_key=g.user.secret_key)

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
    if (g.user == None):
        s3 = botoAPI.client('s3')
    else:
        s3 = botoAPI.client('s3', aws_access_key_id=g.user.access_key,
        aws_secret_access_key=g.user.secret_key)

    try:
        response = s3.list_buckets()
    except ClientError as e:
        print(e)
        return e.response

    S3InstancesInfo = response['Buckets']
    for instance in S3InstancesInfo:
        S3Instances.append(instance['Name'])

    return S3Instances