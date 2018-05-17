import pymysql

from .models import Capture, Replay

def updateCapture(captureId, captureStatus, db_session):
    """Function to update a given capture's status

       Keyword arguments:
        captureId -- the id of the capture to update
        captureStatus -- an integer value [0, 1, 2, 3] representing [not started, in progress, success, error]
    """

    try:
        capture = db_session.query(Capture).filter(Capture.captureId == captureId).update({"captureStatus": captureStatus})
        db_session.commit()
    except:
	    db_session.rollback()


def updateCaptureEndTime(captureId, endTime, db_session):
    """Function to update a capture's end time

       Keyword arguments:
        captureId -- the id of the capture to update
        endTime -- the time when the capture was stopped
    """

    formatted_end_time = endTime.split('.', 1)[0].replace('T', ' ')
    try:
        capture = db_session.query(Capture).filter(Capture.captureId == captureId).update({"endTime": formatted_end_time})
        db_session.commit()
    except:
	    db_session.rollback()


def updateReplay(replayId, replayStatus, db_session):
    """Function to update a given replay's status

       Keyword arguments:
         replayId -- the id of the replay to update
         replayStatus -- an integer value [0, 1, 2, 3] representing [not started, in progress, success, error]
    """

    try:
        replay = db_session.query(Replay).filter(Replay.replayId == replayId).update({"replayStatus": replayStatus})
        db_session.commit()
    except:
        db_session.rollback()

def updateKeys(username, accessKey, secretKey, db_session):
    """Function to update a users keys

       Keyword arguments:
         username -- users unique username
         accessKey -- new access key
         secretKey -- new secret key
    """

    try:
        user = db_session.query(User).filter(User.username == username).update({"access_key": accessKey, "secret_key", secretKey})
        db_session.commit()
    except:
        db_session.rollback()
