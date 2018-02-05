# This file should not be called anywhere else except for 
# CatStone-MyCRT/mycrt-backend/main.py
from src.database.getRecords import *
from src.database.updateRecords import *
from src.database.addRecords import *
import datetime, time

def runScheduler():
    
    insertCapture(1, "test-capture-7", "2018-02-04 00:00:01", "2018-02-04 16:58:02",
                   "testBucket", "test-capture-7.log",
                   "test-rds", "test", "testPW", "testDB")
    insertCapture(1, "test-capture-8", "2018-02-04 00:00:01", "2018-02-04 16:58:30",
                  "testBucket", "test-capture-8.log",
                  "test-rds", "test", "testPW", "testDB")
    while True:
        #Wait for 1 second
        time.sleep(1)

        #Get all of the current captures
        print("Currently getting all captures")
        currentCaptures = getAllCapturesThatHaveNotCompleted()

        #The current time 
        now = datetime.datetime.now()

        #Go through all the captures we received
        for capture in currentCaptures:
            #Obtain the datetime for the capture
            id = capture[0]
            endTime = capture[1]

            # strAsDateTime = datetime.datetime.strptime(capture[1], timeFormat)
            print("Comparing time at now: ", now, " to time of ", endTime)
            if endTime <= now:
                updateCapture(id, 1)
                print("capture ", id, "is done")
            else:
                print("capture ", id, "is not done")


def main():
    runScheduler()

if __name__ == "__main__":
    main()
  