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
from src.email.email_server import sendEmail

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

def capture(rds_endpoint, region_name, db_user, db_password, db_name, start_time, end_time, alias, bucket_name, user, db_session):
    try:
        sql = db_query

        connection = pymysql.connect(rds_endpoint, user=db_user, passwd=db_password, db=db_name, connect_timeout=5)
        queries = []

        if connection.open:
            connection.close()
    except OperationalError as e:
        return {'Error': {'Message': 'Failed to connect to your database with credentials',
                      'Code': 400}}

    newCapture = insertCapture(user.id, alias, start_time.split('.', 1)[0].replace('T', ' '), end_time.split(
        '.', 1)[0].replace('T', ' '), bucket_name, alias, rds_endpoint, db_user, db_password, db_name, region_name, db_session)
    if (newCapture):
        return newCapture[0][0]

    return {'Error': {'Message': 'Failed to insert capture into database',
                      'Code': 400}}


def completeCapture(capture, user, db_session):
    s3 = boto3.client('s3', aws_access_key_id=user.access_key,
     aws_secret_access_key=user.secret_key)
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

    if len(errList) > 0:
        updateCapture(capture['captureId'], CAPTURE_STATUS_ERROR, db_session)
        sendEmail(capture['captureId'], user.email, db_session)
        print(errList)
    else:
        updateCapture(capture['captureId'], CAPTURE_STATUS_SUCCESS, db_session)
        sendEmail(capture['captureId'], user.email, db_session)

    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "CPUUtilization", currentCapture['regionName'], user)
    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "FreeableMemory", currentCapture['regionName'], user)
    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "ReadIOPS", currentCapture['regionName'], user)
    save_metrics(currentCapture['captureAlias'], currentCapture['startTime'], currentCapture['endTime'], currentCapture['s3Bucket'], currentCapture['rdsInstance'], "WriteIOPS", currentCapture['regionName'], user)

    try:
        os.remove(currentCapture['captureAlias'] + ".metrics")
        os.remove(fileName)
    except:
        pass
