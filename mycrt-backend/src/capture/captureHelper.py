import argparse
import os.path
import sys
import boto3
import json
import datetime

from botocore.exceptions import NoRegionError, ClientError
from flask_login import current_user

#from src.database.updateRecords import *
#from src.database.getRecords import *
#from src.capture.capture import completeCapture

def getRDSInstances(region_name, botoAPI = boto3):
    DBInstances = []
    if (current_user == None):
        rds = botoAPI.client('rds')
    else:
        rds = botoAPI.client('rds', region_name=region_name,
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
    if (current_user == None):
        s3 = botoAPI.client('s3')
    else:
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

def checkAllRDSInstances():
    currentCaptures = getAllCapturesThatHaveNotCompleted()

    #The current time 
    now = datetime.datetime.now()

    #Go through all the captures we received
    for capture in currentCaptures:
     
     #Obtain the datetime for the capture
        id = capture[0]
        endTime = capture[1]
        startTime = capture[2]

        # strAsDateTime = datetime.datetime.strptime(capture[1], timeFormat)
        if endTime <= now:
            completeCapture(id, 2)
        elif startTime <= now and endTime >= now:
            updateCapture(id, 1)
