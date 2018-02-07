import pymysql

from .mycrt_database import db
from .models import Capture
from .user import User

def getUserFromEmail(email):
	""" Function to check if an email already exists inside the database

		Keyword arguments:
		email -- the email that we want to check that exists
	"""
	getUserQuery = session.query(User).filter(User.email == email)
	return session.execute(getUserQuery).fetchall()

def getUserFromUsername(username):
	"""
		Function to get a User given the username

		Keyword arguments:
		username -- the username of the user you want to obtain
	"""
	userQuery = session.query(User).filter(User.username == username)
	return session.execute(userQuery).fetchall()

def getUserEmail(username):
	"""
		Function to get a user email

		Keyword arguments:
		username -- the username of the user you want to obtain an email from
	"""
	userEmail = session.query(User.email).filter(User.username == username)
	return session.execute(userEmail).fetchall()

def getAllCaptures(username):
	''' Function to get All Captures

		Keyword arguments:
		username -- the uesrname of the user you want to get all captures from
	'''
	user_captures = session.query(Capture).join(User).filter(User.username == username)
	return session.execute(user_captures).fetchall()

def getCaptureRDSInformation(captureAlias):
	""" Function to get RDS Information from Capture

		Keyword arguments:
		captureAlias -- the alias of the capture you want RDS Information from
	"""
	rdsInformation = session.query(Capture.rdsInstance, Capture.rdsUsername, Capture.rdsPassword, Capture.rdsDatabase).filter(Capture.captureAlias == captureAlias)
	return session.execute(rdsInformation).fetchall()

def getCaptureFromId(captureId):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query.filter(Capture.captureId == captureId)
	return session.execute(captureInformation).fetchall()

def getCaptureStatus(captureId):
	"""Function to get a capture's status after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = session.query(Capture.captureId, Capture.captureStatus).filter(Capture.captureId == captureId)
	return session.execute(captureInformation).fetchall()

def getUsersSuccessfulCaptures(userId):
	"""Function to get a user's succesful captures after receiving a userId

		Keyboard arguments:
		userId -- the id of the user whose successful captures you want to access
	"""
	captureInformation = Capture.query.filter(Capture.userId == userId, Capture.captureStatus == 1)
	return session.execute(captureInformation).fetchall()
