import pymysql

from .mycrt_database import db
from .models import Capture
from .user import User

session = db.db_session
def checkUsernameExists(username):
	""" Function to check if a username already exists inside the database

		Keyword arguments:
		username -- the username that we want to check that exists

		Return value:
		returns True if the username exists
		        False if the username doesn't exist
	"""

	getUserQuery = session.query(User).filter(User.username == username)
	users = session.execute(getUserQuery).fetchall()

	return True if len(users) else False

def checkEmailExists(email):
	""" Function to check if an email already exists inside the database

		Keyword arguments:
		email -- the email that we want to check that exists

		Return value:
		returns True if the email exists
		        False if the email doesn't exist
	"""

	getUserQuery = session.query(User).filter(User.email == email)
	users = session.execute(getUserQuery).fetchall()

	return True if len(users) else False

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

		Keyword arguments:
		userId -- the id of the user whose successful captures you want to access
	"""
	captureInformation = Capture.query.filter(Capture.userId == userId, Capture.captureStatus == 1)
	return session.execute(captureInformation).fetchall()
<<<<<<< HEAD

def getAllCapturesThatHaveNotCompleted():
	"""Function to get all current captures that have a status of 0
	"""

	captureInformation = session.query(Capture.captureId, Capture.endTime, Capture.captureStatus).filter(Capture.captureStatus == 0)
	return session.execute(captureInformation).fetchall()
=======
>>>>>>> 8a8f4e4d930ce315f3fe6c59bc963de18eeeebc9
