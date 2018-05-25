from src.database.updateRecords import updateCapture, updateCaptureEndTime
from src.database.getRecords import getAllIncompleteCaptures, getUserFromId
from src.capture.capture import completeCapture
from src.database.models import User

import datetime
import threading

def checkAllRDSInstances(db_session):
    currentCaptures = getAllIncompleteCaptures(db_session)

    #The current time
    now = datetime.datetime.now() + datetime.timedelta(hours=8)

    #Go through all the captures we received
    for capture in currentCaptures:
        print(capture)
        print(capture['startTime'] + datetime.timedelta(minutes=5) + datetime.timedelta(hours=1))
        print(now)
        if capture['endTime'] and capture['endTime']  + datetime.timedelta(hours=1) <= now:
            user = getUserFromId(capture["userId"], db_session)[0]
            userObject = User(id=user[0], username=user[1], password=user[2],
                              email=user[3], access_key=user[4],
                              secret_key=user[5], notificationLife=user[6])
            thread = threading.Thread(target=completeCapture, args=(capture, userObject, db_session,))
            thread.daemon = True
            thread.start()
            # completeCapture(capture, User(user), db_session)
        elif capture['startTime'] + datetime.timedelta(minutes=5) + datetime.timedelta(hours=1) <= now:
            updateCaptureEndTime(capture['captureId'], now.strftime("%Y-%m-%dT%H:%M:%S.000Z"), db_session)
            capture['endTime'] = now
            user = getUserFromId(capture["userId"], db_session)[0]
            userObject = User(id=user[0], username=user[1], password=user[2],
                              email=user[3], access_key=user[4],
                              secret_key=user[5], notificationLife=user[6])
            thread = threading.Thread(target=completeCapture, args=(capture, userObject, db_session,))
            thread.daemon = True
            thread.start()
        elif capture['endTime'] and capture['startTime']  + datetime.timedelta(hours=1) <= now and capture['endTime'] + datetime.timedelta(hours=1) > now:
            updateCapture(capture['captureId'], 1, db_session)
