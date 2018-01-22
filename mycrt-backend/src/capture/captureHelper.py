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
    try:
        response = rds.describe_db_instances()
        DBInstancesInfo = response['DBInstances']
        for instance in DBInstancesInfo:
            DBInstances.append(instance['DBInstanceIdentifier'])
    except ClientError as e:
        print(e)
        return 0

    return {'count': len(DBInstances), 'rdsInstances': DBInstances}
