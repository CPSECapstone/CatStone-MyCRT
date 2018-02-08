import unittest
import os
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))

import smtplib
from email.mime.text import MIMEText
from flask_login import current_user
from src.database.getRecords import getCaptureFromId
from flask_login import current_user

EMAIL = "mycrtNotifications@gmail.com"
PASS = "myCRTTool"

def sendEmail(captureId):
   s = smtplib.SMTP('smtp.gmail.com', port=587)

   userCapture = getCaptureFromId(captureId)

   if (userCapture.captureStatus):
      body =  ("Capture " + userCapture.captureAlias + " on RDS instance " +
                userCapture.rdsInstance + " has succeeded. Please refer to your " +
                userCapture.s3Bucket + " S3 bucket to view the relevant log and metric files")
      subject = "Sucess: Capture " + userCapture.captureAlias
   else:
      body = ("Capture " + userCapture.captureAlias + " on RDS instance " +
                userCapture.rdsInstance + " has failed. Please refer to your " +
                userCapture.s3Bucket + " S3 bucket to view the relevant log and metric files")
      subject = "Failure: Capture " + userCapture.captureAlias

   msg = MIMEText(body)
   msg['Subject'] = subject
   msg['From'] = EMAIL
   msg['To'] = current_user.email

   try:
      s.ehlo()
      s.starttls()
      s.login(EMAIL, PASS)
      s.sendmail(EMAIL, recipient, msg.as_string())
      s.quit()
      return 0
   except:
      return 1
