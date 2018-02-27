import pymysql

from .models import Capture

def updateCapture(captureId, captureStatus, db_session):
    """Function to update a given capture's status

       Keyboard arguments:
        captureId -- the id of the capture to update
        captureStatus -- an integer value [1, 0, -1] representing [success, no status, failure]
    """

    try:
        capture = db_session.query(Capture).filter(Capture.captureId == captureId).update({"captureStatus": captureStatus})
        db_session.commit()
    except:
	    db_session.rollback()
