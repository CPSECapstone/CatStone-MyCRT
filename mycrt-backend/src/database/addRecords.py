import pymysql

from dbConnector import db
from models import *
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
		db.session.add(capture)
		db.session.commit()
	except:
		db.session.rollback()


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
		db.session.add(metric)
		db.session.commit()
	except:
		db.session.rollback()

''' Function to insert a user into the database
   Example: insertUser("AndrewTest", 
                       "HashedPassword",
                       "test@gmail.com", 
                       "testAccess", 
                       "testSecret")
'''
def insertUser(userName, userPassword, email, accessKey, secretKey):
		user = User(userName, userPassword, email, accessKey, secretKey)

		try:
			db.session.add(user)
			db.session.commit()
		except:
			db.session.rollback()


