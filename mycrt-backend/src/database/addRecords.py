import pymysql

from dbConnector import getConn

'''Function used to insert a capture into the database
   Example usage: insertCapture(1, 
                                "test-capture-2", 
                               "2018-01-01 00:00:01", 
                               "2018-01-01 00:00:02", 
                               "testBucket", 
                               "test-capture-1.log", 
                               "test-rds")
'''
def insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance):
	with getConn().cursor() as cur:
		try:
			cur.execute("""INSERT INTO Captures (userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance)
				                       values   (%s, %s, %s, %s, %s, %s, %s)""",
				        (userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance))
			getConn().commit()
			print("[SUCCESS]: Inserted Capture '" + captureAlias + "' into Captures table")
		except pymysql.Error as e:
			print("[ERROR]:", e.args[0], e.args[1])
			getConn().rollback()


#Simple function to insert a capture metric
def insertCaptureMetric(capture, bucket, metricFile):
	insertMetric(captureAlias=capture, s3Bucket=bucket, metricFileName=metricFile)

#Simple function to insert a replay metric
def insertReplayMetric(replay, bucket, metricFile):
	insertMetric(replayAlias=replay, s3Bucket=bucket, metricFileName=metricFile)

#Function used to insert MetricFiles 
#Note: This should NOT be used anywhere else in the system.
def insertMetric(captureAlias=None, replayAlias=None, s3Bucket=None, metricFileName=None):
	if captureAlias is not None:
		with getConn().cursor() as cur:
			try:
				cur.execute("""INSERT INTO Metrics (captureAlias, s3Bucket, metricFileName)
					                       values  (%s, %s, %s)""",
					        (captureAlias, s3Bucket, metricFileName))
				getConn().commit()
				print("[SUCCESS]: Inserted Capture Metric '" + metricFileName + "' for Capture '" + captureAlias + "'")
			except pymysql.Error as e:
				print("[ERROR]:", e.args[0], e.args[1])
				getConn().rollback()
	else:
		with getConn().cursor() as cur:
			try:
				cur.execute("""INSERT INTO Metrics (replayAlias, s3Bucket, metricFileName)
					                       values  (%s, %s, %s)""",
					        (replayAlias, s3Bucket, metricFileName))
				getConn().commit()
				print("[SUCCESS]: Inserted Replay Metric '" + metricFileName + "' for Replay '" + replayAlias + "'")
			except pymysql.Error as e:
				print("[ERROR]:", e.args[0], e.args[1])
				getConn().rollback()

insertCapture(1, "test-capture-2", "2018-01-01 00:00:01", "2018-01-01 00:00:02", "testBucket", "test-capture-1.log", "test-rds")
insertCaptureMetric("test-capture-2", "testBucket", "test-capture-1.log")