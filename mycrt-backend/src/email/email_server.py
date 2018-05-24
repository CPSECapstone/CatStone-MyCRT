import unittest
import os
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))

import smtplib
from email.mime.text import MIMEText
from src.database.getRecords import getCaptureFromId, getReplayFromId

EMAIL = "mycrtNotifications@gmail.com"
PASS = "myCRTTool"

def sendCaptureEmail(captureId, userEmail, db_session):
   s = smtplib.SMTP('smtp.gmail.com', port=587)

   userCapture = getCaptureFromId(captureId, db_session)[0]

   if (userCapture['captureStatus'] == 2):
      body =  ("Capture '" + userCapture['captureAlias'] + "' on RDS instance '" +
                userCapture['rdsInstance'] + "' has succeeded. Please refer to your '" +
                userCapture['s3Bucket'] + "' S3 bucket to view the relevant log and metric files")
      subject = "Success: Capture " + userCapture['captureAlias']
   elif (userCapture['captureStatus'] == 3):
      body = ("Capture '" + userCapture['captureAlias'] + "' on RDS instance '" +
                userCapture['rdsInstance'] + "' has failed. Please refer to your '" +
                userCapture['s3Bucket'] + "' S3 bucket to view the relevant log and metric files")
      subject = "Failure: Capture " + userCapture['captureAlias']

   msg = MIMEText(body)
   msg['Subject'] = subject
   msg['From'] = EMAIL
   msg['To'] = userEmail

   try:
      s.ehlo()
      s.starttls()
      s.login(EMAIL, PASS)
      s.sendmail(EMAIL, userEmail, msg.as_string())
      s.quit()
      return 0
   except:
      return 1

def sendReplayEmail(replayId, userEmail, db_session):
    s = smtplib.SMTP('smtp.gmail.com', port=587)

    userReplay = getReplayFromId(replayId, db_session)[0]

    if (userReplay['replayStatus'] == 2):
       body =  ("Replay '" + userReplay['replayAlias'] + "' on RDS instance '" +
                 userReplay['rdsInstance'] + "' has succeeded. Please refer to your '" +
                 userReplay['s3Bucket'] + "' S3 bucket to view the relevant log and metric files")
       subject = "Success: Replay '" + userReplay['replayAlias']
    elif (userReplay['replayStatus'] == 3):
       body = ("Replay '" + userReplay['replayAlias'] + "' on RDS instance '" +
                 userReplay['rdsInstance'] + "' has failed. Please refer to your '" +
                 userReplay['s3Bucket'] + "' S3 bucket to view the relevant log and metric files")
       subject = "Failure: Replay " + userReplay['replayAlias']

def sendStatusEmail(status, user_capture_replay, userEmail, db_session):
    print("attempting to send email to "+ userEmail +"...")
    if ('captureAlias' in user_capture_replay.keys()):
        aliasString = "Capture '" + user_capture_replay['captureAlias'] + "'"
    elif ('replayAlias' in user_capture_replay.keys()):
        aliasString = "Replay '" + user_capture_replay['replayAlias']  + "'"

    if (status == 2):
        body =  (aliasString + " on RDS instance '" +
                  user_capture_replay['rdsInstance'] + "' has succeeded. Please refer to your '" +
                  user_capture_replay['s3Bucket'] + "' S3 bucket to view the relevant log and metric files")
        subject = "Success: " + aliasString
    elif (status == 3):
        body = (aliasString + " on RDS instance '" +
                  userReplay['rdsInstance'] + "' has failed. Please refer to your '" +
                  userReplay['s3Bucket'] + "' S3 bucket to view the relevant log and metric files")
        subject = "Failure: " + aliasString

    sendEmail(body, subject, userEmail, db_session)

def sendEmail(body, subject, userEmail, db_session):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = EMAIL
    msg['To'] = userEmail

    try:
       s.ehlo()
       s.starttls()
       s.login(EMAIL, PASS)
       s.sendmail(EMAIL, userEmail, msg.as_string())
       s.quit()
       return 0
    except:
       print("email failed to send")
       return 1
