from src.database.updateRecords import *
from src.database.getRecords import *
from src.capture.capture import completeCapture

import datetime


def checkAllRDSInstances():
    currentCaptures = getAllCapturesThatHaveNotCompleted()

    #The current time 
    now = datetime.datetime.now()

    #Go through all the captures we received
    for capture in currentCaptures:
     
        if capture['endTime'] <= now:
            completeCapture(capture)
        elif capture['startTime'] <= now and capture['endTime'] > now:
            updateCapture(capture['captureId'], 1)
