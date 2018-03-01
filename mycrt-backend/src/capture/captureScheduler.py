from src.database.updateRecords import updateCapture
from src.database.getRecords import getAllCapturesThatHaveNotCompleted
from src.capture.capture import completeCapture

import datetime


def checkAllRDSInstances(user, db_session):
    currentCaptures = getAllCapturesThatHaveNotCompleted(user.id, db_session)

    #The current time 
    now = datetime.datetime.now() + datetime.timedelta(hours=8)

    #Go through all the captures we received
    for capture in currentCaptures:
        if capture['endTime'] <= now:
            completeCapture(capture, user, db_session)
        elif capture['startTime'] <= now and capture['endTime'] > now:
            updateCapture(capture['captureId'], 1, db_session)
