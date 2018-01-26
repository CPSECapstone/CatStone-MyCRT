from .dbConnector import db

class User(db.Model):

	userId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	username = db.Column(db.String(128), unique=True)
	userPassword = db.Column(db.String(128))
	email = db.Column(db.String(128))
	acessKey = db.Column(db.String(128))
	secretKey = db.Column(db.String(128))
	notificationLife = db.Column(db.Integer)

	def __init__(self, username, userPassword, email, accessKey, secretKey, notificationLife=10):
		self.username = username
		self.userPassword = userPassword
		self.email = email
		self.accessKey = accessKey
		self.secretKey = secretKey
		self.notificationLife = notificationLife

	def __repr__(self):
		return '<User %r %r %r %r %r %r' % (self.username, self.userPassword, self.email, self.accessKey, self.secretKey, self.notificationLife)

class Notification(db.Model):

	notificationId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	userId = db.Column(db.Integer, db.ForeignKey(User.userId))
	notificationMessage = db.Column(db.String(128))
	timeActive = db.Column(db.Integer)

	def __init__(self, userId, notificationMessage, timeActive):
		self.userId = userId
		self.notificationMessage = notificationMessage
		self.timeActive = timeActive

	def __repr__(self):
		return '<Notification %r %r %r' % (self.userId, self.notificationMessage, self.timeActive)

	user = db.relationship('User', foreign_keys='Notification.userId')

class Capture(db.Model):

	captureId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	userId = db.Column(db.Integer, db.ForeignKey(User.userId))
	captureAlias = db.Column(db.String(64), unique=True)
	startTime = db.Column(db.DateTime(timezone=True))
	endTime = db.Column(db.DateTime(timezone=True))
	s3Bucket = db.Column(db.String(64))
	logFileName = db.Column(db.String(64))
	rdsInstance = db.Column(db.String(64))
	rdsUsername = db.Column(db.String(64))
	rdsPassword = db.Column(db.String(64))
	rdsDatabase = db.Column(db.String(64))

	def __init__(self, userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
		self.userId = userId
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
		return '<Capture %r %r %r %r %r %r %r %r %r %r' % (self.userId, self.captureAlias, self.startTime, self.endTime, self.s3Bucket, self.logFileName, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase)

	user = db.relationship('User', foreign_keys='Capture.userId')

class Replay(db.Model):

	replayId = db.Column(db.Integer, primary_key=True, autoincrement=True)
	userId = db.Column(db.Integer, db.ForeignKey(User.userId))
	captureId = db.Column(db.Integer, db.ForeignKey(Capture.captureId))
	replayAlias = db.Column(db.String(64), unique=True)
	rdsInstance = db.Column(db.String(64))
	rdsUsername = db.Column(db.String(64))
	rdsPassword = db.Column(db.String(64))
	rdsDatabase = db.Column(db.String(64))

	def __init__(self, userId, captureId, replayAlias, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
		self.userId = userId
		self.captureId = captureId
		self.replayAlias = replayAlias
		self.rdsInstance = rdsInstance
		self.rdsUsername = rdsUsername
		self.rdsPassword = rdsPassword
		self.rdsDatabase = rdsDatabase

	def __repr__(self):
		return '<Replay %r %r %r %r %r %r %r' % (self.userId, self.captureId, self.replayAlias, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase)

	user = db.relationship('User', foreign_keys='Replay.userId')
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
