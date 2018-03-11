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