import pymysql

from dbConnector import db
from models import *

''' Function to get All Captures
	getAllCaptures("testUserName")
'''
def getAllCaptures(username):
	user_captures = db.session.query(Capture).join(User).filter(User.username == username)
	return db.session.execute(user_captures).fetchall()

''' Function to get a user email
    getUserEmail("testUserName")
'''
def getUserEmail(username):
	userEmail = db.session.query(User.email).filter(User.username == username)
	return db.session.execute(userEmail).fetchall()

''' Function to get RDS Information from Capture
    getCaptureRDSInformation("test-capture-2")

'''
def getCaptureRDSInformation(captureAlias):
	rdsInformation = db.session.query(Capture.rdsInstance, Capture.rdsUsername, Capture.rdsPassword, Capture.rdsDatabase).filter(Capture.captureAlias == captureAlias)
	return db.session.execute(rdsInformation).fetchall()

