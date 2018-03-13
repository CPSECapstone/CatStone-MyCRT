import pymysql
from pymysql import OperationalError, MySQLError
from datetime import datetime
from src.database.getRecords import getReplayFromId
from src.metrics.metrics import save_metrics
import _thread

time_format = "%Y-%m-%d %H:%M:%S"

def main():
    try:
        #DATABASE INFO HERE
        connection = pymysql.connect(host='localhost', user="root", port=3306, db="testreplay", connect_timeout=5)

        while (True):
            cur_time = datetime.now().replace(microsecond=0).strftime(time_format)
            print(cur_time)
            check_if_replay_started(connection)
            check_if_replay_completed(connection)
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT * FROM SCHEDULED_QUERY WHERE startTime = %s", (cur_time))
                to_be_run = cursor.fetchall()
                for query in to_be_run:
                    _thread.start_new_thread(run_query, (query['replayId'], query['query'],))
                cursor.execute(
                    "DELETE FROM SCHEDULED_QUERY WHERE queryId IN (SELECT * FROM (SELECT queryId FROM SCHEDULED_QUERY WHERE startTime = %s) AS q)",
                    (cur_time))
                cursor.close()
            connection.commit()

    except MySQLError as e:
        print(e)
    finally:
        if connection is not None and connection.open:
            connection.close()

def check_if_replay_started(connection):
    with connection.cursor(pymysql.cursors.DictCursor) as cursor:
        # checking new queries added to the table and updating their replay status
        cursor.execute("SELECT replayId FROM SCHEDULED_QUERY WHERE replayId IN (SELECT replayId FROM REPLAY WHERE replayStatus = 0)")
        replays_to_be_started = cursor.fetchall()
        for replayId in replays_to_be_started:
            cursor.execute("UPDATE replay SET replayStatus = 1 WHERE replayId = $s", (replayId))
        cursor.close()
    connection.commit()

def check_if_replay_completed(connection):
    with connection.cursor(pymysql.cursors.DictCursor) as cursor:
        cursor.execute("SELECT * FROM replay WHERE replayStatus = 1 AND replayId NOT IN (SELECT replayId FROM SCHEDULED_QUERY)")
        completed_replays = cursor.fetchall()
        for replay in completed_replays:
            end_time = datetime.now().replace(microsecond=0).strftime(time_format)
            cursor.execute("UPDATE replay SET replayStatus = 2 WHERE replayId = $s", (replay['replayId']))
            save_replay_metrics(replay, end_time)
        cursor.close()
    connection.commit()

def save_replay_metrics(replay, end_time):
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "CPUUtilization", replay['regionName'])
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "FreeableMemory", replay['regionName'])
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "ReadIOPS", replay['regionName'])
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "WriteIOPS", replay['regionName'])

def run_query(replayId, query):
    try:
        #DATABASE INFO HERE
        connection = pymysql.connect(host='localhost', user="root", port=3306, db="testreplay", connect_timeout=5)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM REPLAY WHERE replayId = %s", (replayId))
            replay = cursor.fetchone()
            ########
            inner_conn = None
            try:
                inner_conn = pymysql.connect(host=replay['rdsInstance'], user=replay['rdsUsername'],
                                             passwd=replay['rdsPassword'], db=replay['rdsDatabase'], connect_timeout=5)

                with inner_conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    cursor.execute(query)
                    cursor.close()
                inner_conn.commit()
                print("done committing")

            except MySQLError as e:
                print(e)
            finally:
                if inner_conn is not None and inner_conn.open:
                    inner_conn.close()
            ########
            cursor.close()
        connection.commit()

    except MySQLError as e:
        print(e)
    finally:
        if connection is not None and connection.open:
            connection.close()


if __name__ == '__main__':
    main()