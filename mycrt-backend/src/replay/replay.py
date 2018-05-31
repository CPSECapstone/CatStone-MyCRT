import os.path
import boto3
import csv
from botocore.exceptions import NoRegionError, ClientError
from src.database.updateRecords import updateReplay
from src.database.addRecords import insertScheduledQuery
from src.database.getRecords import getCaptureFromId
from src.metrics.metrics import save_metrics
from src.email.email_server import sendReplayEmail
from datetime import datetime, timedelta
from flask import g
import warnings
import pymysql
import rpyc
from pytz import utc, timezone
from pymysql import OperationalError, MySQLError
rpyc.core.protocol.DEFAULT_CONFIG['allow_pickle'] = True
from src.database.models import User

REPLAY_STATUS_ERROR = 3
REPLAY_STATUS_SUCCESS = 2

def get_transactions(capture_alias, bucket_name, user, botoAPI = boto3):
    s3 = botoAPI.resource('s3', aws_access_key_id=user.access_key,
     aws_secret_access_key=user.secret_key)

    try:
        s3.Bucket(bucket_name).download_file(capture_alias, capture_alias)
    except ClientError as e:
        return e.response

    with open(capture_alias, "r") as f:
        query_reader = csv.reader(f)
        transactions = [(row[0], row[1]) for row in query_reader]

    return transactions

def get_times_and_transactions(capture_alias, bucket_name):
    s3 = boto3.resource('s3', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)

    try:
        s3.Bucket(bucket_name).download_file(capture_alias, capture_alias)
    except ClientError as e:
        return e.response

    with open(capture_alias, "r") as f:
        query_reader = csv.reader(f)
        transactions = [(row[0], row[1]) for row in query_reader]

    return transactions

def replay(replay_id, replay_alias, rds_endpoint, region_name, db_user, db_password, db_name, bucket_name, capture, db_session, user):
    print("starting replay")
    transactions = get_transactions(capture['captureAlias'] + ".log", capture['s3Bucket'], user)
    errList = []

    startTime = datetime.utcnow()
    try:
        connection = pymysql.connect(rds_endpoint, user=db_user, passwd=db_password, db=db_name, connect_timeout=5)

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore")
                for query in transactions:
                        print(query[1])
                        cursor.execute(query[1])
            cursor.close()
        connection.commit()

        if connection.open:
            connection.close()

    except MySQLError as e:
        errList.append(e)
        if connection.open:
            connection.close()

    endTime = datetime.utcnow()

    if len(errList) > 0:
        print(errList)
        updateReplay(replay_id, REPLAY_STATUS_ERROR, db_session)
    else:
        updateReplay(replay_id, REPLAY_STATUS_SUCCESS, db_session)
        save_metrics(replay_alias, startTime, endTime, bucket_name, rds_endpoint, "CPUUtilization", region_name, user)
        save_metrics(replay_alias, startTime, endTime, bucket_name, rds_endpoint, "FreeableMemory", region_name, user)
        save_metrics(replay_alias, startTime, endTime, bucket_name, rds_endpoint, "ReadIOPS", region_name, user)
        save_metrics(replay_alias, startTime, endTime, bucket_name, rds_endpoint, "WriteIOPS", region_name, user)

    sendReplayEmail(replay_id, user.email, db_session)

    try:
        os.remove(replay_alias + ".metrics")
        os.remove(capture['captureAlias'] + ".log")
    except:
        pass

def prepare_scheduled_replay(replay, capture, db_session, user):
    transactions = get_times_and_transactions(capture['captureAlias'] + ".log", capture['s3Bucket'])
    time_format = '%Y-%m-%d %H:%M:%S'

    time_delta = capture['endTime'] - capture['startTime']
    conn = rpyc.connect('localhost', 12345, config={"allow_all_attrs": True})

    if transactions == []:

        scheduled_end_time = datetime.strptime(str(replay['startTime'] + time_delta), time_format)
        scheduled_end_time = scheduled_end_time.replace(tzinfo=utc)

        conn.root.add_empty_replay(replay, datetime.strptime(str(replay['startTime'] + timedelta(seconds=10)), time_format).replace(tzinfo=utc), user)
        conn.root.add_empty_replay(replay, scheduled_end_time, user, is_start = False)
    else:
        for transaction in transactions:
            scheduled_time = datetime.strptime(transaction[0], time_format) + time_delta
            scheduled_time = scheduled_time.replace(tzinfo=utc)
            formatted_query = transaction[1].replace("\'", "\\\'")

            if transaction is transactions[-1]:
                conn.root.add_scheduled_replay(replay, formatted_query, str(scheduled_time), db_session, user, is_last_transaction=True)
            else:
                conn.root.add_scheduled_replay(replay, formatted_query, str(scheduled_time), db_session, user)

    try:
        os.remove(capture['captureAlias'] + ".log")
    except:
        pass
