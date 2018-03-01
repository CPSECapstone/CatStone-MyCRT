from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                            as Serializer, BadSignature, SignatureExpired)
from config import SECRET_KEY

from .mycrt_database import MyCrtDb

class User(MyCrtDb.Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String(128), unique=True, nullable=False)
    password = Column(String(512), nullable=False)
    email = Column(String(128), unique=True)
    access_key= Column(String(128), nullable=False)
    secret_key = Column(String(128), nullable=False)
    notificationLife = Column(Integer())

    def __repr__(self):
        return '<User %r %r %r %r %r %r' % (self.username, self.password , self.email, self.access_key, self.secret_key, self.notificationLife)

    def is_authenticated(self):
        return True

    def is_active(self):
        return self.active

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

    def hash_password(self, password):
        self.password = pwd_context.hash(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password)

    def generate_auth_token(self, expiration=600):
        serializer = Serializer(SECRET_KEY, expires_in=expiration)
        return serializer.dumps({ 'id' : self.id })

    @staticmethod
    def verify_auth_token(token):
        serializer = Serializer(SECRET_KEY)
        try:
            data = serializer.loads(token)
        except SignatureExpired:
            return None     # valid token, expired
        except BadSignature:
            return None     # invalid token
        user = User.query.get(data['id'])
        return user


class Notification(MyCrtDb.Base):
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

class Capture(MyCrtDb.Base):
    __tablename__ = 'capture'
    captureId = Column(Integer(), primary_key=True, autoincrement=True)
    userId = Column(Integer(), ForeignKey(User.id))
    captureAlias = Column(String(64), unique=True)
    startTime = Column(DateTime(timezone=True))
    endTime = Column(DateTime(timezone=True))
    s3Bucket = Column(String(64))
    logFileName = Column(String(64))
    rdsInstance = Column(String(128))
    rdsUsername = Column(String(64))
    rdsPassword = Column(String(64))
    rdsDatabase = Column(String(64))
    regionName = Column(String(64))
    captureStatus = Column(Integer(), default=0)

    def __init__(self, userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName, captureStatus=0):
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
        self.regionName = regionName
        self.captureStatus = captureStatus

    def __repr__(self):
        return '<Capture %r %r %r %r %r %r %r %r %r %r %r %r' % (self.userId, self.captureAlias, self.startTime, self.endTime, self.s3Bucket, self.logFileName, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase, self.regionName, self.captureStatus)

    def convertToDict(captures):
        allDicts = []

        for capture in captures:
            newDict = {'captureId': capture[0],
                       'userId': capture[1],
                       'captureAlias': capture[2],
                       'startTime': capture[3],
                       'endTime': capture[4],
                       's3Bucket': capture[5],
                       'logFileName': capture[6],
                       'rdsInstance': capture[7],
                       'rdsUsername': capture[8],
                       'rdsPassword': capture[9],
                       'rdsDatabase': capture[10],
                       'regionName': capture[11],
                       'captureStatus': capture[12]}
            allDicts.append(newDict)

        return allDicts
	#user = relationship('User', foreign_keys='Capture.id')

class Replay(MyCrtDb.Base):
    __tablename__ = 'replay'
    replayId = Column(Integer(), primary_key=True, autoincrement=True)
    userId = Column(Integer(), ForeignKey(User.id))
    captureId = Column(Integer(), ForeignKey(Capture.captureId))
    replayAlias = Column(String(128), unique=True)
    s3Bucket = Column(String(64))
    rdsInstance = Column(String(128))
    rdsUsername = Column(String(64))
    rdsPassword = Column(String(64))
    rdsDatabase = Column(String(64))
    regionName = Column(String(64))
    replayStatus = Column(Integer(), default=0)

    def __init__(self, userId, captureId, replayAlias, s3Bucket, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName, replayStatus):
        self.userId = userId
        self.captureId = captureId
        self.replayAlias = replayAlias
        self.s3Bucket = s3Bucket
        self.rdsInstance = rdsInstance
        self.rdsUsername = rdsUsername
        self.rdsPassword = rdsPassword
        self.rdsDatabase = rdsDatabase
        self.regionName = regionName
        self.replayStatus = replayStatus

    def __repr__(self):
        return '<Replay %r %r %r %r %r %r %r %r %r' % (self.userId, self.captureId, self.replayAlias, self.s3Bucket, self.rdsInstance, self.rdsUsername, self.rdsPassword, self.rdsDatabase, self.regionName, self.replayStatus)

    def convertToDict(replays):
        allDicts = []

        for replay in replays:
            newDict = {'replayId': replay[0],
                       'userId': replay[1],
                       'captureId': replay[2],
                       'replayAlias': replay[3],
                       's3Bucket': replay[4],
                       'rdsInstance': replay[5],
                       'rdsUsername': replay[6],
                       'rdsPassword': replay[7],
                       'rdsDatabase': replay[8],
                       'regionName': replay[9],
                       'replayStatus': replay[10]}
            allDicts.append(newDict)

        return allDicts

	#user = relationship('User', foreign_keys='Replay.id')
    capture = relationship('Capture', foreign_keys='Replay.captureId')

class Metric(MyCrtDb.Base):
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
