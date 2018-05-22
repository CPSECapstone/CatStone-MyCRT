import unittest
from unittest.mock import MagicMock, create_autospec
from src.capture.capture import capture
from src.database.addRecords import insertCapture


@unittest.skip("Helper class")
class TestUser():
    def __init__(self):
        self.id = 0


class MyTestCase(unittest.TestCase):
    def test_good_capture(self):
        mock_insert_capture = MagicMock(return_value=[['expected']])
        mock_pymysql = MagicMock()
        mock_pymysql.connect = MagicMock()
        mock_thread = MagicMock()
        mock_capture = MagicMock()
        user = TestUser()
        result = capture('rds_endpoint', 'region_name', 'db_user', 'db_password', 'db_name', 'start_time', 'end_time', 'alias', 'bucket_name', user, 'db_session', pymysql=mock_pymysql, insertCapture=mock_insert_capture, Capture=mock_capture, Thread=mock_thread)

        assert result == 'expected'
        mock_insert_capture.assert_called_with(user.id, 'alias', 'start_time', 'end_time', 'bucket_name', 'alias', 'rds_endpoint', 'db_user', 'db_password', 'db_name', 'region_name', 'db_session')


if __name__ == '__main__':
    unittest.main()
