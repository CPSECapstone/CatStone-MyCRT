import pymysql

from .user_database import Base, user_repository
from .models import *

session = user_repository.db_session

def updateCapture(captureId, captureStatus):
    """Function to update a given capture's status

       Keyboard arguments:
	    captureId -- the id of the capture to update
        captureStatus -- an integer value [1, 0, -1] representing [success, no status, failure]
    """

    try:
        capture = session.query(Capture).filter(Capture.captureId == captureId).update({"captureStatus": captureStatus})
        session.commit()
    except:
	    session.rollback()