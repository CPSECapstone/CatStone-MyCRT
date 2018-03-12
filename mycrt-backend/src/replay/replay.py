import os.path
import boto3
import csv
from botocore.exceptions import NoRegionError, ClientError
from src.database.updateRecords import updateReplay
from src.database.addRecords import insertScheduledQuery
from src.database.getRecords import getCaptureFromId
from datetime import datetime
from flask import g
import pymysql
from pymysql import OperationalError, MySQLError


REPLAY_STATUS_ERROR = 3
REPLAY_STATUS_SUCCESS = 2

def get_transactions(replay_alias, bucket_name):
    s3 = boto3.resource('s3', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)

    try:
        s3.Bucket(bucket_name).download_file(replay_alias, replay_alias)
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise

    transactions = []

    with open(replay_alias, "r") as f:
        query_reader = csv.reader(f)
        for row in query_reader:
            transactions.append(row[1])

    return transactions

def get_times_and_transactions(replay_alias, bucket_name):
    s3 = boto3.resource('s3', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)

    try:
        s3.Bucket(bucket_name).download_file(replay_alias, replay_alias)
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            raise

    transactions = []

    with open(replay_alias, "r") as f:
        query_reader = csv.reader(f)
        for row in query_reader:
            transactions.append((row[0], row[1]))

    return transactions

def replay(replay_id, rds_endpoint, region_name, db_user, db_password, db_name, alias, bucket_name, db_session):

    transactions = get_transactions(alias, bucket_name)
    errList = []

    try:
        connection = pymysql.connect(rds_endpoint, user=db_user, passwd=db_password, db=db_name, connect_timeout=5)

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            for query in transactions:
                cursor.execute(query)
            cursor.close()
        connection.commit()

        if connection.open:
            connection.close()
    except MySQLError as e:
        errList.append(e)
        if connection.open:
            connection.close()

    if len(errList) > 0:
        updateReplay(replay_id, REPLAY_STATUS_ERROR, db_session)
        print(errList)
    else:
        updateReplay(replay_id, REPLAY_STATUS_SUCCESS, db_session)

def prepare_scheduled_replay(replay, db_session):
    transactions = get_times_and_transactions(replay['replayAlias'], replay['buckets3Bucket'])
    capture = getCaptureFromId(replay['captureId'])
    time_format = '%Y-%m-%d %H:%M:%S'

    time_delta = datetime.strptime(replay['startTime'], time_format) - datetime.strptime(capture['startTime'], time_format)

    for transaction in transactions:
        scheduled_time = datetime.strptime(transaction[0], time_format) + time_delta
        formatted_query = transaction[1].replace("\'", "\\\'")
        insertScheduledQuery(replay['replayId'], replay['userId'], str(scheduled_time.strftime(time_format)), formatted_query, db_session)
