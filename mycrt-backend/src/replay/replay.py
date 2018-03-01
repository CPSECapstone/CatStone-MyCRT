import os.path
import boto3
import csv
from botocore.exceptions import NoRegionError, ClientError
from src.database.addRecords import insertCapture
from flask import g
import pymysql
from pymysql import OperationalError, MySQLError


def get_transaction_log(replay_alias, bucket_name):
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

def replay(rds_endpoint, region_name, db_user, db_password, db_name, alias, bucket_name, db_session):

    transactions = get_transaction_log(alias, bucket_name)

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
        print(e)
        if connection.open:
            connection.close()