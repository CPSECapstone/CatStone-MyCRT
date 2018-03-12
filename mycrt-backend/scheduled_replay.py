import pymysql
from pymysql import OperationalError, MySQLError
from datetime import datetime
from src.database.getRecords import getReplayFromId
import _thread

def main():
    time_format = "%Y-%m-%d %H:%M:%S"
    try:
        #DATABASE INFO HERE
        connection = pymysql.connect(host='localhost', user="root", port=3306, db="testreplay", connect_timeout=5)

        while (True):
            cur_time = datetime.now().replace(microsecond=0).strftime(time_format)
            print(cur_time)
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