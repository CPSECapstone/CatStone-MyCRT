import pymysql

from dbConnector import db
from models import *

def getAllCaptures(username):
	''' Function to get All Captures
		
		Keyword arguments:
		username -- the uesrname of the user you want to get all captures from
	'''
	user_captures = db.session.query(Capture).join(User).filter(User.username == username)
	return db.session.execute(user_captures).fetchall()

def getUserEmail(username):
	"""
		Function to get a user email
    	
		Keyword arguments:
		username -- the username of the user you want to obtain an email from
	"""
	userEmail = db.session.query(User.email).filter(User.username == username)
	return db.session.execute(userEmail).fetchall()

def getCaptureRDSInformation(captureAlias):
	""" Function to get RDS Information from Capture
		
		Keyword arguments:
		captureAlias -- the alias of the capture you want RDS Information from
	"""
	rdsInformation = db.session.query(Capture.rdsInstance, Capture.rdsUsername, Capture.rdsPassword, Capture.rdsDatabase).filter(Capture.captureAlias == captureAlias)
	return db.session.execute(rdsInformation).fetchall()

def getCaptureFromId(captureId):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query.filter(Capture.captureId == captureId)
	print(captureInformation)
	return db.session.execute(captureInformation).fetchall()



