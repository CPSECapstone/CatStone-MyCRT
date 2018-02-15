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
     
     #Obtain the datetime for the capture
        id = capture[0]
        endTime = capture[1]
        startTime = capture[2]

        if endTime <= now:
            completeCapture(id, 2)
        elif startTime <= now and endTime > now:
            updateCapture(id, 1)
