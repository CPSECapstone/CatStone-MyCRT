import boto3

from botocore.exceptions import ClientError

def getRDSInstances(region_name, user, botoAPI = boto3):
    DBInstances = []
    if (user == None):
        rds = botoAPI.client('rds')
    else:
        rds = botoAPI.client('rds', region_name=region_name,
        aws_access_key_id=user.access_key,
        aws_secret_access_key=user.secret_key)

    try:
        response = rds.describe_db_instances()
    except ClientError as e:
        return e.response

    DBInstancesInfo = response['DBInstances']

    for instance in DBInstancesInfo:
        DBInstances.append(instance['Endpoint']['Address'])

    return DBInstances

def getS3Instances(user, botoAPI = boto3):
    S3Instances = []
    if (user == None):
        s3 = botoAPI.client('s3')
    else:
        s3 = botoAPI.client('s3', aws_access_key_id=user.access_key,
        aws_secret_access_key=user.secret_key)

    try:
        response = s3.list_buckets()
    except ClientError as e:
        print(e)
        return e.response

    S3InstancesInfo = response['Buckets']
    for instance in S3InstancesInfo:
        S3Instances.append(instance['Name'])

    return S3Instances
