#from .onnector import db
from src.database.user import User
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, backref

from .user_database import Base

class Notification(Base):
    __tablename__ = 'notifications'

    notificationId = Column(Integer(), primary_key=True, autoincrement=True)
    userId = Column(Integer(), ForeignKey(User.id))
    notificationMessage = Column(String(128))
    timeActive = Column(Integer())

    def __init__(self, userId, notificationMessage, timeActive):
        self.userId = userId
        self.notificationMessage = notificationMessage
        self.timeActive = timeActive

    def __repr__(self):
        return '<Notification %r %r %r' % (self.userId, self.notificationMessage, self.timeActive)

	#user = relationship('User', foreign_keys='Notification.id')

class Capture(Base):
    __tablename__ = 'capture'
    captureId = Column(Integer(), primary_key=True, autoincrement=True)
    userId = Column(Integer(), ForeignKey(User.id))
    captureAlias = Column(String(64), unique=True)
    startTime = Column(DateTime(timezone=True))
    endTime = Column(DateTime(timezone=True))
    s3Bucket = Column(String(64))
    logFileName = Column(String(64))
    rdsInstance = Column(String(64))
    rdsUsername = Column(String(64))
    rdsPassword = Column(String(64))
    rdsDatabase = Column(String(64))
    captureStatus = Column(Integer(), default=0)

    def __init__(self, userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, captureStatus=0):
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
        self.captureStatus = captureStatus

    def __repr__(self):
        return '<Capture %r %r %r %r %r %r %r %r %r %r %r' % (self.userId, self.captureAlias, self.startTime, self.endTime, self.s3Bucket, self.logFileName, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase, self.captureStatus)

	#user = relationship('User', foreign_keys='Capture.id')

class Replay(Base):
    __tablename__ = 'replay'
    replayId = Column(Integer(), primary_key=True, autoincrement=True)
    userId = Column(Integer(), ForeignKey(User.id))
    captureId = Column(Integer(), ForeignKey(Capture.captureId))
    replayAlias = Column(String(64), unique=True)
    rdsInstance = Column(String(64))
    rdsUsername = Column(String(64))
    rdsPassword = Column(String(64))
    rdsDatabase = Column(String(64))

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

	#user = relationship('User', foreign_keys='Replay.id')
    capture = relationship('Capture', foreign_keys='Replay.captureId')

class Metric(Base):
    __tablename__ = 'metric'
    metricId = Column(Integer(), primary_key=True, autoincrement=True)
    captureAlias = Column(String(64), ForeignKey(Capture.captureAlias), nullable=True)
    replayAlias = Column(String(64), ForeignKey(Replay.replayAlias), nullable=True)
    s3Bucket = Column(String(64))
    metricFileName = Column(String(64))

    def __init__(self, s3Bucket, metricFileName, captureAlias=None, replayAlias=None):
        self.s3Bucket = s3Bucket
        self.metricFileName = metricFileName
        self.captureAlias = captureAlias
        self.replayAlias = replayAlias

    def __repr__(self):
        return '<Metric %r %r %r %r' % (self.s3Bucket, self.metricFileName, self.captureAlias, self.replayAlias)

    capture = relationship('Capture', foreign_keys='Metric.captureAlias')
    replay = relationship('Replay', foreign_keys='Metric.replayAlias')


# class Notification(Model):

# 	notificationId = Column(Integer, primary_key=True, autoincrement=True)
# 	userId = Column(Integer, ForeignKey(User.id))
# 	notificationMessage = Column(String(128))
# 	timeActive = Column(Integer)

# 	def __init__(self, userId, notificationMessage, timeActive):
# 		self.userId = userId
# 		self.notificationMessage = notificationMessage
# 		self.timeActive = timeActive

# 	def __repr__(self):
# 		return '<Notification %r %r %r' % (self.userId, self.notificationMessage, self.timeActive)

# 	#user = relationship('User', foreign_keys='Notification.id')

# class Capture(Model):

# 	captureId = Column(Integer, primary_key=True, autoincrement=True)
# 	userId = Column(Integer, ForeignKey(User.id))
# 	captureAlias = Column(String(64), unique=True)
# 	startTime = Column(DateTime(timezone=True))
# 	endTime = Column(DateTime(timezone=True))
# 	s3Bucket = Column(String(64))
# 	logFileName = Column(String(64))
# 	rdsInstance = Column(String(64))
# 	rdsUsername = Column(String(64))
# 	rdsPassword = Column(String(64))
# 	rdsDatabase = Column(String(64))
# 	wasSuccessful = Column(Boolean, default=False)

# 	def __init__(self, userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
# 		self.userId = userId
# 		self.captureAlias = captureAlias
# 		self.startTime = startTime
# 		self.endTime = endTime
# 		self.s3Bucket = s3Bucket
# 		self.logFileName = logFileName
# 		self.rdsInstance = rdsInstance
# 		self.rdsUsername = rdsUsername
# 		self.rdsPassword = rdsPassword
# 		self.rdsDatabase = rdsDatabase

# 	def __repr__(self):
# 		return '<Capture %r %r %r %r %r %r %r %r %r %r %r' % (self.userId, self.captureAlias, self.startTime, self.endTime, self.s3Bucket, self.logFileName, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase, self.wasSuccessful)

# 	#user = relationship('User', foreign_keys='Capture.id')

# class Replay(Model):

# 	replayId = Column(Integer, primary_key=True, autoincrement=True)
# 	userId = Column(Integer, ForeignKey(User.id))
# 	captureId = Column(Integer, ForeignKey(Capture.captureId))
# 	replayAlias = Column(String(64), unique=True)
# 	rdsInstance = Column(String(64))
# 	rdsUsername = Column(String(64))
# 	rdsPassword = Column(String(64))
# 	rdsDatabase = Column(String(64))

# 	def __init__(self, userId, captureId, replayAlias, rdsInstance, rdsUsername, rdsPassword, rdsDatabase):
# 		self.userId = userId
# 		self.captureId = captureId
# 		self.replayAlias = replayAlias
# 		self.rdsInstance = rdsInstance
# 		self.rdsUsername = rdsUsername
# 		self.rdsPassword = rdsPassword
# 		self.rdsDatabase = rdsDatabase

# 	def __repr__(self):
# 		return '<Replay %r %r %r %r %r %r %r' % (self.userId, self.captureId, self.replayAlias, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase)

# 	#user = relationship('User', foreign_keys='Replay.id')
# 	capture = relationship('Capture', foreign_keys='Replay.captureId')

# class Metric(Model):

# 	metricId = Column(Integer, primary_key=True, autoincrement=True)
# 	captureAlias = Column(String(64), ForeignKey(Capture.captureAlias), nullable=True)
# 	replayAlias = Column(String(64), ForeignKey(Replay.replayAlias), nullable=True)
# 	s3Bucket = Column(String(64))
# 	metricFileName = Column(String(64))

# 	def __init__(self, s3Bucket, metricFileName, captureAlias=None, replayAlias=None):
# 		self.s3Bucket = s3Bucket
# 		self.metricFileName = metricFileName
# 		self.captureAlias = captureAlias
# 		self.replayAlias = replayAlias

# 	def __repr__(self):
# 		return '<Metric %r %r %r %r' % (self.s3Bucket, self.metricFileName, self.captureAlias, self.replayAlias)

# 	capture = relationship('Capture', foreign_keys='Metric.captureAlias')
# 	replay = relationship('Replay', foreign_keys='Metric.replayAlias')

