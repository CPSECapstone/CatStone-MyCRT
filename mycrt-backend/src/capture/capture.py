import argparse
import os.path
import sys
import pymysql
import boto3
from botocore.exceptions import NoRegionError, ClientError
from datetime import datetime
from . import rds_config

#s3 setup
s3 = boto3.client('s3')

#will have: def capture(region, rds_endpoint, db_user, db_password, db_name, start_time, end_time, local_log_file, bucket_name):
def capture(region, rds_instance, log_file, local_log_file, bucket_name):
    try:
        rds = boto3.client('rds', region)
    except NoRegionError:
        rds = boto3.client('rds','us-west-1')

    with open(local_log_file, 'w') as f:
        try:
            rds_host = rds_config.db_endpoint
            name = rds_config.db_username
            password = rds_config.db_password
            db_name = rds_config.db_name
            sql = rds_config.db_query

            port = 3306
            start_time = datetime(2018, 1, 22, 19, 20, 5)
            end_time = datetime(2018, 1, 22, 21, 20, 5)

            connection = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
            queries = []

            try:
                with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                    cursor.execute(sql)
                    for row in cursor.fetchall():
                        if row["event_time"] >= start_time and row["event_time"] <= end_time:
                            queries.insert(0, row["argument"] + ";\n")

            finally:
                connection.close()

            for query in queries:
                f.write(query)
        except ClientError as e:
            print(e)
            return 1

    s3.upload_file(local_log_file, bucket_name, local_log_file)
    return 0
