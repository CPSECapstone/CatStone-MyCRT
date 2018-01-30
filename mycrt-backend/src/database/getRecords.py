import pymysql

from .dbConnector import db
from .models import *


def checkUsernameExists(username):
	""" Function to check if a username already exists inside the database
	
		Keyword arguments:
		username -- the username that we want to check that exists

		Return value:
		returns True if the username exists
		        False if the username doesn't exist
	"""

	getUserQuery = db.session.query(User).filter(User.username == username)
	users = db.session.execute(getUserQuery).fetchall()

	return True if users.length else False

def checkEmailExists(email):
	""" Function to check if an email already exists inside the database
	
		Keyword arguments:
		email -- the email that we want to check that exists

		Return value:
		returns True if the email exists
		        False if the email doesn't exist
	"""

	getUserQuery = db.session.query(User).filter(User.email == email)
	users = db.session.execute(getUserQuery).fetchall()

	return True if users.length else False

def getUserFromUsername(username):
	"""
		Function to get a User given the username

		Keyword arguments:
		username -- the username of the user you want to obtain
	"""
	userQuery = db.session.query(User).filter(User.username == username)
	return db.session.execute(userquery).fetchall()

def getUserEmail(username):
	"""
		Function to get a user email

		Keyword arguments:
		username -- the username of the user you want to obtain an email from
	"""
	userEmail = db.session.query(User.email).filter(User.username == username)
	return db.session.execute(userEmail).fetchall()

def getAllCaptures(username):
	''' Function to get All Captures

		Keyword arguments:
		username -- the uesrname of the user you want to get all captures from
	'''
	user_captures = db.session.query(Capture).join(User).filter(User.username == username)
	return db.session.execute(user_captures).fetchall()

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
	return db.session.execute(captureInformation).fetchall()

def getCaptureStatus(captureId):
	"""Function to get a capture's status after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query(Capture.wasSuccessful).filter(Capture.captureId == captureId)
	return db.session.execute(captureInformation).fetchall()

def getUsersSuccessfulCaptures(userId):
	"""Function to get a user's succesful captures after receiving a userId

		Keyboard arguments:
		userId -- the id of the user whose successful captures you want to access
	"""
	captureInformation = Capture.query.filter(Capture.userId == userId, Capture.captureStatus == 1)
	return db.session.execute(captureInformation).fetchall()

def getAllCapturesThatHaveNotCompleted():
	"""Function to get all incomplete captures
	"""

	captureInfoQuery = Capture.query(Capture.captureId, Capture.endTime).filter(Capture.wasSuccessful == False)
	return db.session.execute(captureInfoQuery).fetchall()