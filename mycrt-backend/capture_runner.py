from pymysql import OperationalError, MySQLError
import pymysql
import time
from flask import Flask
from src.database.mycrt_database import MyCrtDb

from src.capture.captureScheduler import checkAllRDSInstances

def run_capture_app():
    app = Flask(__name__, static_url_path='')
    app.config.from_object('config')

    

    while True:
        print("Sleeping for 5 seconds...")
        time.sleep(5)
        print("Finished sleeping")
        db = MyCrtDb(app.config['SQLALCHEMY_DATABASE_URI'])
        checkAllRDSInstances(db.get_session())
        print("Finished Checking All RDS Instances")



if __name__ == '__main__':
    run_capture_app()