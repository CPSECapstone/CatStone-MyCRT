import argparse
import os.path
import sys
import pymysql
import boto3
import csv
from botocore.exceptions import NoRegionError, ClientError
from datetime import datetime, timedelta
from dateutil import parser
from pymysql import OperationalError, MySQLError
from src.database.addRecords import insertCapture
from src.database.getRecords import getCaptureFromId
from src.database.updateRecords import updateCapture
from src.metrics.metrics import save_metrics
from flask import g

db_query = """Select event_time, argument from mysql.general_log where
user_host NOT LIKE \'%%rdsadmin%%\' and user_host NOT LIKE \'%%root%%\'
and user_host NOT LIKE \'[%%\'
and argument NOT LIKE \'%%_schema.%%\'
and argument NOT LIKE \'%%use %%\'
and argument NOT LIKE \'%%testcatstonedb%%\'
and argument NOT LIKE \'%%mysql%%\'
and argument NOT LIKE \'SELECT %%()%%\'
and argument NOT LIKE \'%%general_log%%\'
and argument NOT LIKE \'SET AUTOCOMMIT%%\'
and argument NOT LIKE \'Access denied%%\'
and argument NOT LIKE \'set %% utf8%%\'
and argument NOT LIKE \'set sql_safe_updates%%\'
and argument NOT LIKE \'SHOW %%\'
and argument NOT LIKE \'SET SESSION %% READ\'
and LENGTH(argument) > 0
ORDER BY
EXTRACT(YEAR_MONTH FROM event_time),
EXTRACT(DAY FROM event_time),
EXTRACT(HOUR FROM event_time),
EXTRACT(MINUTE FROM event_time),
EXTRACT(SECOND FROM event_time)"""
CAPTURE_STATUS_ERROR = 3
CAPTURE_STATUS_SUCCESS = 2

def capture(rds_endpoint, region_name, db_user, db_password, db_name, start_time, end_time, alias, bucket_name, db_session):
    try:
        sql = db_query

        connection = pymysql.connect(rds_endpoint, user=db_user, passwd=db_password, db=db_name, connect_timeout=5)
        queries = []

    except OperationalError as e:
        return e
    finally:
        if connection.open:
            connection.close()

    newCapture = insertCapture(g.user.id, alias, start_time.split('.', 1)[0].replace('T', ' '), end_time.split(
        '.', 1)[0].replace('T', ' '), bucket_name, alias, rds_endpoint, db_user, db_password, db_name, region_name, db_session)
    if (newCapture):
        return newCapture[0][0]
    print(newCapture, " was the new capture")
    return -1


def completeCapture(capture, db_session):
    s3 = boto3.client('s3', aws_access_key_id=g.user.access_key,
     aws_secret_access_key=g.user.secret_key)
    currentCapture = capture

    fileName = currentCapture['captureAlias'] + '.log'
    errList = []

    if os.path.exists(fileName):
        os.remove(fileName)

    with open(fileName, 'w', newline='') as f:
        try:
            sql = db_query

            connection = pymysql.connect(currentCapture['rdsInstance'],
                                         user=currentCapture['rdsUsername'],
                                         passwd=currentCapture['rdsPassword'],
                                         db=currentCapture['rdsDatabase'],
                                         connect_timeout=5)
            queries = []

        except OperationalError as e:
            errList.append(e)
        finally:
            if connection.open:
                connection.close()

        try:
            if len(errList) == 0:
                connection = pymysql.connect(currentCapture['rdsInstance'],
                                         user=currentCapture['rdsUsername'],
                                         passwd=currentCapture['rdsPassword'],
                                         db=currentCapture['rdsDatabase'],
                                         connect_timeout=5)

                with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                    cursor.execute(sql)
                    for row in cursor.fetchall():
                        if row["event_time"] >= currentCapture['startTime'] and row["event_time"] <= currentCapture['endTime']:
                            queries.append([str(row["event_time"]), str(row["argument"].replace('\n', ' ').replace('\t', ' '))])
        except MySQLError as e:
            errList.append(e)
        finally:
            cursor.close()
            if connection.open:
                connection.close()

        file_writer = csv.writer(f)

        for query in queries:
            file_writer.writerow(query)

    try:
        if len(errList) == 0:
            response = s3.upload_file(fileName, currentCapture['s3Bucket'], fileName)
    except ClientError as e:
        errList.append(e)
    finally:
        os.remove(fileName)

    if len(errList) > 0:
        updateCapture(capture['captureId'], CAPTURE_STATUS_ERROR, db_session)
        print(errList)
    else:
        updateCapture(capture['captureId'], CAPTURE_STATUS_SUCCESS, db_session)

    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "CPUUtilization", currentCapture['regionName'])
    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "FreeableMemory", currentCapture['regionName'])
    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "ReadIOPS", currentCapture['regionName'])
    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "WriteIOPS", currentCapture['regionName'])

    try:
        os.remove(currentCapture['captureAlias'] + ".metrics")
    except:
        pass
