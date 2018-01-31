from .dbConnector import db
from src.database.user import User


class Notification(db.Model):

	notificationId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	id = db.Column(db.Integer, db.ForeignKey(User.id))
	notificationMessage = db.Column(db.String(128))
	timeActive = db.Column(db.Integer)

	def __init__(self, id, notificationMessage, timeActive):
		self.id = id
		self.notificationMessage = notificationMessage
		self.timeActive = timeActive

	def __repr__(self):
		return '<Notification %r %r %r' % (self.id, self.notificationMessage, self.timeActive)

	#user = db.relationship('User', foreign_keys='Notification.id')

class Capture(db.Model):

	captureId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	id = db.Column(db.Integer, db.ForeignKey(User.id))
	captureAlias = db.Column(db.String(64), unique=True)
	startTime = db.Column(db.DateTime(timezone=True))
	endTime = db.Column(db.DateTime(timezone=True))
	s3Bucket = db.Column(db.String(64))
	logFileName = db.Column(db.String(64))
	rdsInstance = db.Column(db.String(64))
	rdsUsername = db.Column(db.String(64))
	rdsPassword = db.Column(db.String(64))
	rdsDatabase = db.Column(db.String(64))
	wasSuccessful = db.Column(db.Boolean, default=False)

	def __init__(self, id, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
		self.id = id
		self.captureAlias = captureAlias
		self.startTime = startTime
		self.endTime = endTime
		self.s3Bucket = s3Bucket
		self.logFileName = logFileName
		self.rdsInstance = rdsInstance
		self.rdsUsername = rdsUsername
		self.rdsPassword = rdsPassword
		self.rdsDatabase = rdsDatabase

	def __repr__(self):
		return '<Capture %r %r %r %r %r %r %r %r %r %r %r' % (self.id, self.captureAlias, self.startTime, self.endTime, self.s3Bucket, self.logFileName, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase, self.wasSuccessful)

	#user = db.relationship('User', foreign_keys='Capture.id')

class Replay(db.Model):

	replayId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	id = db.Column(db.Integer, db.ForeignKey(User.id))
	captureId = db.Column(db.Integer, db.ForeignKey(Capture.captureId))
	replayAlias = db.Column(db.String(64), unique=True)
	rdsInstance = db.Column(db.String(64))
	rdsUsername = db.Column(db.String(64))
	rdsPassword = db.Column(db.String(64))
	rdsDatabase = db.Column(db.String(64))

	def __init__(self, id, captureId, replayAlias, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
		self.id = id
		self.captureId = captureId
		self.replayAlias = replayAlias
		self.rdsInstance = rdsInstance
		self.rdsUsername = rdsUsername
		self.rdsPassword = rdsPassword
		self.rdsDatabase = rdsDatabase

	def __repr__(self):
		return '<Replay %r %r %r %r %r %r %r' % (self.id, self.captureId, self.replayAlias, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase)

	#user = db.relationship('User', foreign_keys='Replay.id')
	capture = db.relationship('Capture', foreign_keys='Replay.captureId')

class Metric(db.Model):

	metricId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	captureAlias = db.Column(db.String(64), db.ForeignKey(Capture.captureAlias), nullable=True)
	replayAlias = db.Column(db.String(64), db.ForeignKey(Replay.replayAlias), nullable=True)
	s3Bucket = db.Column(db.String(64))
	metricFileName = db.Column(db.String(64))

	def __init__(self, s3Bucket, metricFileName, captureAlias=None, replayAlias=None):
		self.s3Bucket = s3Bucket
		self.metricFileName = metricFileName
		self.captureAlias = captureAlias
		self.replayAlias = replayAlias

	def __repr__(self):
		return '<Metric %r %r %r %r' % (self.s3Bucket, self.metricFileName, self.captureAlias, self.replayAlias)

	capture = db.relationship('Capture', foreign_keys='Metric.captureAlias')
	replay = db.relationship('Replay', foreign_keys='Metric.replayAlias')
