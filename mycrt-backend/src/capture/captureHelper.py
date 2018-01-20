import argparse
import os.path
import sys
import boto3
import json
from botocore.exceptions import NoRegionError, ClientError

#AWS setup
s3 = boto3.client('s3')
rds = boto3.client('rds')

def getRDSInstances():
    DBInstances = []

    response = rds.describe_db_instances()
    DBInstancesInfo = response['DBInstances']
    for instance in DBInstancesInfo:
        DBInstances.append(instance['DBInstanceIdentifier'])

    return DBInstances
