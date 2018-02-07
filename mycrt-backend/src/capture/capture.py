import argparse
import os.path
import sys
import pymysql
import boto3
from botocore.exceptions import NoRegionError, ClientError
from datetime import datetime
from pymysql import OperationalError
from .database.addRecords import *

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
ORDER by event_time desc"""

s3 = boto3.client('s3')

def capture(rds_endpoint, db_user, db_password, db_name, start_time, end_time, local_log_file, bucket_name):
    parsed_start = datetime.strptime(start_time[:-1], "%Y-%m-%dT%H:%M:%S.%f")
    parsed_end = datetime.strptime(end_time[:-1], "%Y-%m-%dT%H:%M:%S.%f")

    with open(local_log_file, 'w') as f:
        try:
            sql = db_query

            connection = pymysql.connect(rds_endpoint, user=db_user, passwd=db_password, db=db_name, connect_timeout=5)
            queries = []

        except OperationalError as e:
            return e

        try:
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(sql)
                for row in cursor.fetchall():
                    if row["event_time"] >= parsed_start and row["event_time"] <= parsed_end:
                        queries.insert(0, row["argument"] + ";\n")
        except MySQLError as e:
            return e
        finally:
            connection.close()

        for query in queries:
            f.write(query)

    try:
        response = s3.upload_file(local_log_file, bucket_name, local_log_file)
    except ClientError as e:
        return e

    newCapture = insertCapture(current_user.id, local_log_file, start_time,
        end_time, bucket_name, local_log_file + '.log', rds_endpoint,
        db_user, db_password, db_name)

    return newCapture
