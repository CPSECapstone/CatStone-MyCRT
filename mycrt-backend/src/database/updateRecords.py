import pymysql

from .dbConnector import db
from .models import *

def updateCapture(captureId, captureStatus):
    """Function to update a given capture's status

       Keyboard arguments:
	    captureId -- the id of the capture to update
        captureStatus -- an integer value [1, 0, -1] representing [success, no status, failure]
    """

    try:
        capture = Capture.query.get(captureId)
        capture.captureStatus = captureStatus
        db.session.commit()
    except:
	    db.session.rollback()