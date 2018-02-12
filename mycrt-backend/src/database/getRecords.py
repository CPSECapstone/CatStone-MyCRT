import pymysql

from .mycrt_database import db_session
from .models import Capture, User


def getUserFromEmail(email):
	""" Function to check if an email already exists inside the database

		Keyword arguments:
		email -- the email that we want to check that exists
	"""
	getUserQuery = db_session.query(User).filter(User.email == email)
	return db_session.execute(getUserQuery).fetchall()

def getUserFromUsername(username):
	"""
		Function to get a User given the username

		Keyword arguments:
		username -- the username of the user you want to obtain
	"""
	userQuery = db_session.query(User).filter(User.username == username)
	return db_session.execute(userQuery).fetchall()

def getUserEmail(username):
	"""
		Function to get a user email

		Keyword arguments:
		username -- the username of the user you want to obtain an email from
	"""
	userEmail = db_session.query(User.email).filter(User.username == username)
	return db_session.execute(userEmail).fetchall()

def getAllCaptures(username):
	''' Function to get All Captures

		Keyword arguments:
		username -- the uesrname of the user you want to get all captures from
	'''
	user_captures = db_session.query(Capture).join(User).filter(User.username == username)
	return db_session.execute(user_captures).fetchall()

def getCaptureRDSInformation(captureAlias):
	""" Function to get RDS Information from Capture

		Keyword arguments:
		captureAlias -- the alias of the capture you want RDS Information from
	"""
	rdsInformation = db_session.query(Capture.rdsInstance, Capture.rdsUsername, Capture.rdsPassword, Capture.rdsDatabase).filter(Capture.captureAlias == captureAlias)
	return db_session.execute(rdsInformation).fetchall()

def getCaptureFromId(captureId):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query.filter(Capture.captureId == captureId)
	return db_session.execute(captureInformation).fetchall()

def getCaptureFromAlias(captureAlias):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query.filter(Capture.captureAlias == captureAlias)
	return db_session.execute(captureInformation).fetchall()

def getCaptureStatus(captureId):
	"""Function to get a capture's status after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = db_session.query(Capture.captureId, Capture.captureStatus).filter(Capture.captureId == captureId)
	return db_session.execute(captureInformation).fetchall()

def getUsersSuccessfulCaptures(userId):
	"""Function to get a user's succesful captures after receiving a userId

		Keyword arguments:
		userId -- the id of the user whose successful captures you want to access
	"""
	captureInformation = Capture.query.filter(Capture.userId == userId, Capture.captureStatus == 1)
	return db_session.execute(captureInformation).fetchall()

def getAllCapturesThatHaveNotCompleted():
	"""Function to get all current captures that have a status of 0
	"""

	captureInformation = db_session.query(Capture.captureId, Capture.endTime, Capture.captureStatus).filter(Capture.captureStatus == 0)
	return db_session.execute(captureInformation).fetchall()
