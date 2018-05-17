from src.database.updateRecords import updateCapture
from src.database.getRecords import getAllIncompleteCaptures, getUserFromId
from src.capture.capture import completeCapture
from src.database.models import User

import datetime
import threading

def checkAllRDSInstances(db_session):
    currentCaptures = getAllIncompleteCaptures(db_session)

    #The current time 
    now = datetime.datetime.utcnow()# + datetime.timedelta(hours=8)

    #Go through all the captures we received
    for capture in currentCaptures:
        print("Current time is :", now)
        print(capture['startTime'])
        if capture['endTime'] == None:
            pass
        elif capture['startTime'] <= now and capture['endTime'] > now:
            #datetime.timedelta(hours=1)
            updateCapture(capture['captureId'], 1, db_session)
        elif capture['endTime']<= now:
            user = getUserFromId(capture["userId"], db_session)[0]
            userObject = User(id=user[0], username=user[1], password=user[2],
                              email=user[3], access_key=user[4],
                              secret_key=user[5], notificationLife=user[6])
            thread = threading.Thread(target=completeCapture, args=(capture, userObject, db_session,))
            thread.daemon = True
            thread.start()
            # completeCapture(capture, User(user), db_session)
