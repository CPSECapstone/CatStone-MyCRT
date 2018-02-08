import pymysql

from .mycrt_database import db
from .models import Capture, Metric
from .getRecords import getCaptureFromAlias

session = db.db_session
'''Function used to insert a capture into the database
   Example usage: insertCapture(1,
                                "test-capture-2",
                                "2018-01-01 00:00:01",
                                "2018-01-01 00:00:02",
                                "testBucket",
                                "test-capture-1.log",
                                "test-rds",
                                "test",
                                "testPW",
                                "testDB")
'''
def insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
	capture = Capture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase)

	try:
		session.add(capture)
		session.commit()
	except:
		session.rollback()

	return getCaptureFromAlias(captureAlias)


'''Simple function to insert a capture metric
   Example: insertCaptureMetric("test-capture-2",
                                "testBucket",
                                "test-capture-1.log")

'''
def insertCaptureMetric(capture, bucket, metricFile):
	insertMetric(captureAlias=capture, s3Bucket=bucket, metricFileName=metricFile)

#Simple function to insert a replay metric
def insertReplayMetric(replay, bucket, metricFile):
	insertMetric(replayAlias=replay, s3Bucket=bucket, metricFileName=metricFile)

#Function used to insert MetricFiles
#Note: This should NOT be used anywhere else in the system.
def insertMetric(captureAlias=None, replayAlias=None, s3Bucket=None, metricFileName=None):
	if captureAlias is not None:
		metric = Metric(s3Bucket, metricFileName, captureAlias=captureAlias)
	else:
		metric = Metric(s3Bucket, metricFileName, replayAlias=replayAlias)

	try:
		session.add(metric)
		session.commit()
	except:
		session.rollback()

''' Function to insert a user into the database
   Example: insertUser("AndrewTest",
                       "HashedPassword",
                       "test@gmail.com",
                       "testAccess",
                       "testSecret")
'''
def insertUser(userName, userPassword, email, accessKey, secretKey):
	db.register_user(username=userName, password=userPassword, email=email, access_key=accessKey, secret_key=secretKey)
