from .user_repository import UserRepository
from .models import Capture, Replay, Metric, ScheduledQuery
from .getRecords import getCaptureFromAlias, getReplayFromAlias

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
                                "testDB",
                                "testRegion",
                                0)
'''
def insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName, db_session, status=None):
	if status is not None:
		capture = Capture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername,
						  rdsPassword, rdsDatabase, regionName, status)
	else:
		capture = Capture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName)
	try:
		db_session.add(capture)
		db_session.commit()
	except:
		db_session.rollback()

	return getCaptureFromAlias(captureAlias, db_session)

'''Function used to insert a replay into the database
   Example usage: insertCapture(1,
                                1,
                                "test-replay-2",
                                "testBucket",
                                "test-rds",
                                "test",
                                "testPW",
                                "testDB",
                                "testRegion",
                                true)
'''
def insertReplay(userId, captureId, replayAlias, s3Bucket, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName, startTime, isFast, db_session, status=0):
	replay = Replay(userId, captureId, replayAlias, s3Bucket, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName, startTime, isFast, status)
	try:
		db_session.add(replay)
		db_session.commit()
	except:
		db_session.rollback()

	return getReplayFromAlias(replayAlias, db_session)[0]["replayId"]

'''Simple function to insert a capture metric
   Example: insertCaptureMetric("test-capture-2",
                                "testBucket",
                                "test-capture-1.log")

'''
def insertCaptureMetric(db_session, capture, bucket, metricFile):
	insertMetric(db_session, captureAlias=capture, s3Bucket=bucket, metricFileName=metricFile)

#Simple function to insert a replay metric
def insertReplayMetric(db_session, replay, bucket, metricFile):
	insertMetric(db_session, replayAlias=replay, s3Bucket=bucket, metricFileName=metricFile)

#Function used to insert MetricFiles
#Note: This should NOT be used anywhere else in the system.
def insertMetric(db_session,captureAlias=None, replayAlias=None, s3Bucket=None,
        metricFileName=None):
	if captureAlias is not None:
		metric = Metric(s3Bucket, metricFileName, captureAlias=captureAlias)
	else:
		metric = Metric(s3Bucket, metricFileName, replayAlias=replayAlias)

	try:
		db_session.add(metric)
		db_session.commit()
	except:
		db_session.rollback()

''' Function to insert a user into the database
   Example: insertUser("AndrewTest",
                       "HashedPassword",
                       "test@gmail.com",
                       "testAccess",
                       "testSecret")
'''
def insertUser(userName, userPassword, email, accessKey, secretKey, db_session):
        user_repository = UserRepository(db_session)
        user_repository.register_user(username=userName, password=userPassword, email=email, access_key=accessKey, secret_key=secretKey)

#Simple function to insert a scheduled query
def insertScheduledQuery(replayId, userId, startTime, query, db_session):
	scheduled_query = ScheduledQuery(replayId, userId, startTime, query)
	try:
		db_session.add(scheduled_query)
		db_session.commit()
	except:
		db_session.rollback()