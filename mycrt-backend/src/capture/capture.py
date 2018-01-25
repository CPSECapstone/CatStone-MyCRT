import argparse
import os.path
import sys
import pymysql
import boto3
from botocore.exceptions import NoRegionError, ClientError
from datetime import datetime
from pymysql import OperationalError
from rds_config import db_query

s3 = boto3.client('s3')

def capture(rds_endpoint, db_user, db_password, db_name, start_time, end_time, local_log_file, bucket_name):
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
                    if row["event_time"] >= start_time and row["event_time"] <= end_time:
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

    return 0

