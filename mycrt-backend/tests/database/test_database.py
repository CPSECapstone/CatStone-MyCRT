import os
from datetime import datetime, timedelta
from src.database.mycrt_database import MyCrtDb
from src.database.addRecords import insertUser, insertCapture, insertReplay
from src.database.getRecords import getUserFromEmail, getCaptureFromAlias, getReplaysFromCapture
from src.database.models import Capture, Replay
import unittest
import tempfile


class TestDatabase(unittest.TestCase):

    def setUp(self):
        self.db_fd,  self.temp_file = tempfile.mkstemp()
        config = {
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///' + self.temp_file,
            'TESTING': True
        }
        self.db = MyCrtDb(config['SQLALCHEMY_DATABASE_URI'])

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.temp_file)

    def test_username_must_be_unique(self):
        username = 'user'
        password = 'password'
        email = 'email'
        accesskey = 'access'
        secretkey = 'secret'
        user1_added = insertUser(username, password, email, accesskey, secretkey, self.db.db_session)
        user2_added = insertUser(username, password, email, accesskey, secretkey, self.db.db_session)
        users_found = getUserFromEmail(email, self.db.db_session)

        assert user1_added
        assert not user2_added
        assert len(users_found) == 1

    def test_capture_must_be_unique(self):
        userId = 1
        captureAlias = 'capture'
        startTime = datetime.utcnow()
        endTime = startTime + timedelta(minutes=30)
        s3Bucket = 's3'
        logFileName = 'log'
        rdsInstance = 'rdsInstance'
        rdsUsername = 'rdsUser'
        rdsPassword = 'rdsPassword'
        rdsDatabase = 'database'
        regionName = 'region'
        capture1 = insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance,
                                rdsUsername, rdsPassword, rdsDatabase, regionName, self.db.db_session, status=None)
        capture2 = insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance,
                                rdsUsername, rdsPassword, rdsDatabase, regionName, self.db.db_session, status=None)
        assert capture1 is not None

        captures_found = getCaptureFromAlias(captureAlias, self.db.db_session)
        assert len(captures_found) == 1

    def test_find_capture_associated_to_a_replay(self):
        userId = 1
        captureAlias = 'capture'
        startTime = datetime.utcnow()
        endTime = startTime + timedelta(minutes=30)
        s3Bucket = 's3'
        logFileName = 'log'
        rdsInstance = 'rdsInstance'
        rdsUsername = 'rdsUser'
        rdsPassword = 'rdsPassword'
        rdsDatabase = 'database'
        regionName = 'region'
        capture1 = insertCapture(userId, captureAlias, startTime, endTime, s3Bucket, logFileName, rdsInstance,
                                 rdsUsername, rdsPassword, rdsDatabase, regionName, self.db.db_session, status=None)
        captureId = capture1[0][0]

        replayAlias = 'replay'
        isFast = False
        replay = insertReplay(userId, captureId, replayAlias, s3Bucket, rdsInstance, rdsUsername, rdsPassword, rdsDatabase, regionName, startTime, isFast, self.db.db_session)
        replay_found = getReplaysFromCapture(captureId, self.db.db_session)
        assert len(replay_found) > 0


if __name__ == '__main__':
    unittest.main()
