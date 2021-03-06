from .models import Capture, User, Replay
from flask import g

def getUserFromEmail(email, db_session):
	""" Function to check if an email already exists inside the database

		Keyword arguments:
		email -- the email that we want to check that exists
	"""
	getUserQuery = db_session.query(User).filter(User.email == email)
	return db_session.execute(getUserQuery).fetchall()

def getUserFromUsername(username, db_session):
	"""
		Function to get a User given the username

		Keyword arguments:
		username -- the username of the user you want to obtain
	"""
	userQuery = db_session.query(User).filter(User.username == username)
	return db_session.execute(userQuery).fetchall()


def getUserFromId(userId, db_session):
	"""
		Function to get a User given the username

		Keyword arguments:
		userId -- the userId of the user you want to obtain
	"""
	userQuery = db_session.query(User).filter(User.id == userId)
	return db_session.execute(userQuery).fetchall()

def getUserEmail(username, db_session):
	"""
		Function to get a user email

		Keyword arguments:
		username -- the username of the user you want to obtain an email from
	"""
	userEmail = db_session.query(User.email).filter(User.username == username)
	return db_session.execute(userEmail).fetchall()

def getUsersCaptures(username, db_session):
    ''' Function to get All Captures

            Keyword arguments:
            username -- the username of the user you want to get all captures from
            db_session -- the database session to query from
    '''
    result = []
    user_captures = db_session.query(Capture).join(User).filter(User.username == username)
    result = Capture.convertToDict(db_session.execute(user_captures).fetchall())

    return result

def getAllCaptures(username, db_session):
	''' Function to get All Captures

		Keyword arguments:
		username -- the uesrname of the user you want to get all captures from
	'''
	result = []
	user_captures = db_session.query(Capture).join(User).filter(User.username == username)
	result = Capture.convertToDict(db_session.execute(user_captures).fetchall())

	return result

def getCaptureRDSInformation(captureAlias, db_session):
	""" Function to get RDS Information from Capture

		Keyword arguments:
		captureAlias -- the alias of the capture you want RDS Information from
	"""
	rdsInformation = db_session.query(Capture.rdsInstance, Capture.rdsUsername, Capture.rdsPassword, Capture.rdsDatabase).filter(Capture.captureAlias == captureAlias)
	return db_session.execute(rdsInformation).fetchall()

def getCaptureFromId(captureId, db_session):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query.filter(Capture.captureId == captureId)
	result = []
	result = Capture.convertToDict(db_session.execute(captureInformation).fetchall())

	return result

def getCaptureFromReplayId(replayId, db_session):
	""" Function to get a capture related to a given replay

	"""
	relatedCapture = db_session.query(Capture).join(Replay).filter(Replay.replayId == replayId)
	result = Capture.convertToDict(db_session.execute(relatedCapture).fetchall())

	return result

def getCaptureFromAlias(captureAlias, db_session):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = Capture.query.filter(Capture.captureAlias == captureAlias)
	return db_session.execute(captureInformation).fetchall()

def getCaptureStatus(captureId, db_session):
	"""Function to get a capture's status after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	captureInformation = db_session.query(Capture.captureId, Capture.captureStatus).filter(Capture.captureId == captureId)
	return db_session.execute(captureInformation).fetchall()

def getUsersSuccessfulCaptures(userId, db_session):
	"""Function to get a user's succesful captures after receiving a userId

		Keyword arguments:
		userId -- the id of the user whose successful captures you want to access
	"""
	captureInformation = Capture.query.filter(Capture.userId == userId, Capture.captureStatus == 1)
	return db_session.execute(captureInformation).fetchall()

def getAllCapturesThatHaveNotCompleted(userId, db_session):
	"""Function to get all current captures that have a status of 0
	"""

	captureInformation = Capture.query.filter(Capture.captureStatus <= 1).filter(Capture.userId == userId)
	return Capture.convertToDict(db_session.execute(captureInformation).fetchall())

def getAllIncompleteCaptures(db_session):
	"""Function to get all current captures that have a status of 0
	"""

	captureInformation = Capture.query.filter(Capture.captureStatus <= 1)
	return Capture.convertToDict(db_session.execute(captureInformation).fetchall())

def getUsersReplays(userId, isFast, db_session):
	''' Function to get All Replays

			Keyword arguments:
			userId -- the userId of the user you want to get all captures from
			db_session -- the database session to query from
	'''
	result = []
	if (isFast != None):
		user_replays = db_session.query(Replay).join(User).filter(User.id == userId, Replay.isFast == int(isFast))
	else:
		user_replays = db_session.query(Replay).join(User).filter(User.id == userId)
	result = Replay.convertToDict(db_session.execute(user_replays).fetchall())

	return result

def getReplayFromId(replayId, db_session):
	""" Function to get a replay after receiving a replayId

		Keyword arguments:
		replayId -- the id of the replay you want to access
	"""
	replayInformation = Replay.query.filter(Replay.replayId == replayId)
	result = []
	result = Replay.convertToDict(db_session.execute(replayInformation).fetchall())

	return result

def getReplayFromAlias(replayAlias, db_session):
	""" Function to get a capture after receiving a captureId

		Keyword arguments:
		captureId -- the id of the capture you want to access
	"""
	replayInformation = Replay.query.filter(Replay.replayAlias == replayAlias)
	return Replay.convertToDict(db_session.execute(replayInformation).fetchall())

def getReplaysFromCapture(captureId, db_session):
	"""Function to get all replays and captures related to a specific captureId
	"""
	replays = Replay.query.filter(Replay.captureId == captureId)

	return Replay.convertToDict(db_session.execute(replays).fetchall())

def getReplayStatus(replayId, db_session):
	"""Function to get a replay's status after receiving a replayId

		Keyword arguments:
		replayId -- the id of the replay you want to access
	"""
	replayInformation = db_session.query(Replay.replayId, Replay.replayStatus).filter(Replay.replayId == replayId)
	return db_session.execute(replayInformation).fetchall()
