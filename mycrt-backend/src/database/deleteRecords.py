import pymysql

from .models import Capture, Replay

def deleteCapture(captureId, db_session):
    """Function to delete a capture

       Keyword arguments:
        captureId -- the id of the capture to delete
    """

    try:
        capture = db_session.query(Capture).filter(Capture.captureId == captureId).delete()
        db_session.commit()
        return capture
    except:
	    db_session.rollback()


def deleteReplay(replayId, db_session):
    """Function to delete a replay

       Keyword arguments:
        replayId -- the id of the replay to delete
    """

    try:
        replay = db_session.query(Replay).filter(Replay.replayId == replayId).delete()
        db_session.commit()
        return repaly
    except:
	    db_session.rollback()
