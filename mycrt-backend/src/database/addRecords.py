from .user_repository import UserRepository
from .models import Capture, Replay, Metric, ScheduledQuery
from .getRecords import getCaptureFromAlias, getReplayFromAlias


def insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername,
                  rdsPassword, rdsDatabase, regionName, db_session, status=None):
    """Function used to insert a capture into the database
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
    """
    if status is not None:
        capture = Capture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername,
                          rdsPassword, rdsDatabase, regionName, status)
    else:
        capture = Capture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername,
                          rdsPassword, rdsDatabase, regionName)
    try:
        db_session.add(capture)
        db_session.commit()
    except:
        db_session.rollback()

    return getCaptureFromAlias(captureAlias, db_session)


def insertReplay(userId, captureId, replayAlias, s3Bucket, rdsInstance, rdsUsername, rdsPassword, rdsDatabase,
                 regionName, startTime, isFast, db_session, status=0):
    """Function used to insert a replay into the database
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
    """
    replay = Replay(userId, captureId, replayAlias, s3Bucket, rdsInstance, rdsUsername, rdsPassword, rdsDatabase,
                    regionName, startTime, isFast, status)
    try:
        db_session.add(replay)
        db_session.commit()
    except:
        db_session.rollback()

    return getReplayFromAlias(replayAlias, db_session)[0]["replayId"]


def insertUser(userName, userPassword, email, accessKey, secretKey, db_session):
    """Function to insert a user into the database
       Example: insertUser("AndrewTest",
                           "HashedPassword",
                           "test@gmail.com",
                           "testAccess",
                           "testSecret")
    """
    user_repository = UserRepository(db_session)
    return user_repository.register_user(username=userName, password=userPassword, email=email, access_key=accessKey,
                                         secret_key=secretKey)


# Simple function to insert a scheduled query
def insertScheduledQuery(replayId, userId, startTime, query, db_session):
    scheduled_query = ScheduledQuery(replayId, userId, startTime, query)
    try:
        db_session.add(scheduled_query)
        db_session.commit()
    except:
        db_session.rollback()
