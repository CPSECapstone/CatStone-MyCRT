import os.path
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
from src.email.email_server import sendCaptureEmail

from src.database.models import Capture

import time
from threading import Thread

CAPTURE_STATUS_ERROR = 3
CAPTURE_STATUS_SUCCESS = 2

SLEEP_INTERVAL = 3500


class CaptureInterval:
    def __init__(self, user, user_capture, start_time, end_time):
        self.errors = []
        self.user = user
        self.capture = user_capture
        self.start_time = start_time
        self.end_time = end_time
        self.filename = user_capture['captureAlias'] + '.log'

    def __enter__(self):
        if os.path.exists(self.filename):
            os.remove(self.filename)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.upload_queries_to_s3()
        self.remove_queries_file()

    def tick(self, start_time, end_time):
        queries = self.get_log(start_time, end_time)
        self.append_queries_to_file(queries)

    def get_log(self, start_time, end_time):
        errors = []
        queries = []
        sql = get_db_query(self.capture['rdsDatabase'])
        try:
            connection = pymysql.connect(self.capture['rdsInstance'],
                                         user=self.capture['rdsUsername'],
                                         passwd=self.capture['rdsPassword'],
                                         db=self.capture['rdsDatabase'],
                                         connect_timeout=5)

            # get the queries from DB
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(sql)
                for row in cursor.fetchall():
                    if row["event_time"] > start_time and row["event_time"] <= end_time:
                        queries.append([str(row["event_time"]), str(row["argument"].replace('\n', ' ').replace('\t', ' '))])
                return queries
        except MySQLError as e:
            errors.append(e)
        finally:
            cursor.close()
            if connection.open:
                connection.close()

    def append_queries_to_file(self, queries):
        with open(self.filename, 'a', newline='') as f:
            file_writer = csv.writer(f)

            for query in queries:
                file_writer.writerow(query)

    def upload_queries_to_s3(self):
        s3 = boto3.client('s3', aws_access_key_id=self.user.access_key,
                          aws_secret_access_key=self.user.secret_key)
        return s3.upload_file(self.filename, self.capture['s3Bucket'], self.filename)

    def remove_queries_file(self):
        os.remove(self.filename)


def time_diff_to_seconds(time_diff):
    return time_diff.days * 24 * 3600 + time_diff.seconds


def capture_loop(user, user_capture, db_session):
    start_time = user_capture['startTime']
    end_time = user_capture['endTime']
    with CaptureInterval(user, user_capture, start_time, end_time) as ctx:
        interval_start_time = start_time
        while interval_start_time < end_time:
            sleep_time = min(SLEEP_INTERVAL, time_diff_to_seconds(end_time - interval_start_time) + 1)
            time.sleep(sleep_time)
            interval_end_time = datetime.utcnow()
            ctx.tick(interval_start_time, interval_end_time)
            interval_start_time = interval_end_time
        errors = ctx.errors

    if len(errors) > 0:
        updateCapture(user_capture['captureId'], CAPTURE_STATUS_ERROR, db_session)
    else:
        updateCapture(user_capture['captureId'], CAPTURE_STATUS_SUCCESS, db_session)
        save_metrics(user_capture['captureAlias'], user_capture['startTime'], user_capture['endTime'], user_capture['s3Bucket'], user_capture['rdsInstance'], "CPUUtilization", user_capture['regionName'], user)
        save_metrics(user_capture['captureAlias'], user_capture['startTime'], user_capture['endTime'], user_capture['s3Bucket'], user_capture['rdsInstance'], "FreeableMemory", user_capture['regionName'], user)
        save_metrics(user_capture['captureAlias'], user_capture['startTime'], user_capture['endTime'], user_capture['s3Bucket'], user_capture['rdsInstance'], "ReadIOPS", user_capture['regionName'], user)
        save_metrics(user_capture['captureAlias'], user_capture['startTime'], user_capture['endTime'], user_capture['s3Bucket'], user_capture['rdsInstance'], "WriteIOPS", user_capture['regionName'], user)

    sendCaptureEmail(user_capture['captureId'], user.email, db_session)


def capture(rds_endpoint, region_name, db_user, db_password, db_name, start_time, end_time, alias, bucket_name, user, db_session, pymysql=pymysql, insertCapture=insertCapture):
    new_capture = insertCapture(user.id, alias, start_time.split('.', 1)[0].replace('T', ' '), end_time.split(
        '.', 1)[0].replace('T', ' '), bucket_name, alias, rds_endpoint, db_user, db_password, db_name, region_name, db_session)
    capture_dict = Capture.convertToDict(new_capture)
    Thread(target=capture_loop, args=[user, capture_dict[0], db_session]).start()
    return new_capture[0][0]


def completeCapture(capture, user, db_session):
    s3 = boto3.client('s3', aws_access_key_id=user.access_key,
                      aws_secret_access_key=user.secret_key)
    currentCapture = capture

    fileName = currentCapture['captureAlias'] + '.log'
    errList = []

    if os.path.exists(fileName):
        os.remove(fileName)

    # write to file
    with open(fileName, 'w', newline='') as f:
        # get the queries
        try:
            sql = get_db_query(currentCapture['rdsDatabase'])

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

                # get the queries from DB
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

        # write queries to csv file
        file_writer = csv.writer(f)

        for query in queries:
            file_writer.writerow(query)

    # save the file to S3
    try:
        if len(errList) == 0:
            response = s3.upload_file(fileName, currentCapture['s3Bucket'], fileName)
    except ClientError as e:
        errList.append(e)

    # update capture status in DB
    if len(errList) > 0:
        updateCapture(capture['captureId'], CAPTURE_STATUS_ERROR, db_session)
    else:
        updateCapture(capture['captureId'], CAPTURE_STATUS_SUCCESS, db_session)
        save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "CPUUtilization", currentCapture['regionName'], user)
        save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "FreeableMemory", currentCapture['regionName'], user)
        save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "ReadIOPS", currentCapture['regionName'], user)
        save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "WriteIOPS", currentCapture['regionName'], user)


    sendCaptureEmail(capture['captureId'], user.email, db_session)

    try:
        os.remove(currentCapture['captureAlias'] + ".metrics")
        os.remove(fileName)
    except:
        pass


def get_db_query(db_name):
    db_query = """Select event_time, argument from mysql.general_log where
    user_host NOT LIKE \'%%rdsadmin%%\' and user_host NOT LIKE \'%%root%%\'
    and user_host NOT LIKE \'[%%\'
    and argument NOT LIKE \'%%_schema.%%\'
    and argument NOT LIKE \'%%use %%\'
    and argument NOT LIKE \'%%"""

    db_query += db_name

    db_query += """%%\'
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

    return db_query