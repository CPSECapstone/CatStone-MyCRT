import os
import src.server
import src.capture
from src.server import create_app, capture_wrapper, sql_connection_wrapper
from src.database.mycrt_database import MyCrtDb
import unittest
from unittest import mock
from unittest.mock import patch
import tempfile
from flask import json
from base64 import b64encode


class TestServer(unittest.TestCase):

    def setUp(self):
        self.db_fd,  self.temp_file = tempfile.mkstemp()
        config = {
                'SQLALCHEMY_DATABASE_URI': 'sqlite:///' + self.temp_file,
                'TESTING': True
        }
        app = create_app(config)
        self.app = app.test_client()
        with app.app_context():
            self.db = MyCrtDb(app.config['SQLALCHEMY_DATABASE_URI'])

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.temp_file)

    def test_login_without_credentials(self):
        result = self.app.get('/authenticate')
        assert result.status_code == 401

    def register_user_request(self, username, password, email, access_key, secret_key):
        """ Helper method for making a register request
        """
        return self.app.post('/users',
                             data=json.dumps({
                                 'username' : username,
                                 'password' : password,
                                 'email'    : email,
                                 'access_key' : access_key,
                                 'secret_key' : secret_key
                             }),
                             content_type='application/json')

    def test_register_valid_user(self):
        username = 'test'
        password = 'test'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'

        result = self.register_user_request(username, password, email, access_key, secret_key)
        assert result.status_code == 201

    def test_cannot_register_user_twice(self):
        username = 'test'
        password = 'test'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'

        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.register_user_request(username, password, email, access_key, secret_key)
        assert result.status_code == 400

    def test_register_user_with_data_missing(self):
        username = 'test'
        password = 'test'
        access_key = 'test_key'
        secret_key = 'test_key'

        result = self.app.post('/users',
                             data = json.dumps({
                                 'username' : username,
                                 'password' : password,
                                 'access_key' : access_key,
                                 'secret_key' : secret_key
                             }),
                             content_type = 'application/json')

        assert result.status_code == 400

    def test_login_with_credentials(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" +  password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']
        assert b'Unauthorized' not in result.data
        assert token is not None and token != ''

    def test_get_captures_with_no_captures_is_empty(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" +  password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        captures = self.app.get('/users/captures', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")
        })
        capture_json = json.loads(captures.data)
        assert capture_json['userCaptures'] == []

    def test_get_replays_with_no_replays_is_empty(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        replays = self.app.get('/users/replays', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")
        })
        replays_json = json.loads(replays.data)
        assert replays_json['userReplays'] == []

    def test_getting_users_s3_with_invalid_keys_fails(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        s3_response = self.app.get('/users/s3Buckets', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")
        })
        s3_json = json.loads(s3_response.data)
        assert s3_response.status_code != 201
        assert 'error' in s3_json

    def test_getting_capture_id_that_doesnt_exist(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        capture_response = self.app.get('/users/captures/1', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")
        })
        capture_json = json.loads(capture_response.data)
        assert capture_response.status_code == 404

    def test_post_capture_with_data_missing_fails(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        capture_response = self.app.post('/users/captures', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")},
                                         data=json.dumps({
                                             'rds_endpoint': 'endpoint',
                                             'region_name': 'region',
                                             'db_user': 'user',
                                             'db_password': 'password',
                                             'db_name': 'name',
                                             'start_time': 'start',
                                             'end_time': 'end',
                                             'alias': 'alias'
                                         }), content_type='application/json')
        assert capture_response.status_code == 400

    @patch('src.server.capture')
    @patch('pymysql.connect')
    def test_successful_capture(self, sql_connector, capture):
        sql_connector.return_value = MockGoodConnection()
        capture.return_value = 1

        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        capture_response = self.app.post('/users/captures', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")},
                                         data=json.dumps({
                                             'rds_endpoint': 'endpoint',
                                             'region_name': 'region',
                                             'db_user': 'user',
                                             'db_password': 'password',
                                             'db_name': 'name',
                                             'start_time': 'start',
                                             'end_time': 'end',
                                             'alias': 'alias',
                                             'bucket_name': 'bucket'
                                         }), content_type='application/json')
        response_json = json.loads(capture_response.data)
        assert capture_response.status_code == 201

    def test_replay_with_missing_data_fails(self):

        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                              headers={
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        replay_response = self.app.post('/users/replays', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")},
                                         data=json.dumps({
                                             'capture_id': 'id',
                                             'replay_alias': 'alias',
                                             'rds_endpoint': 'endpoint',
                                             'db_user': 'user',
                                             'db_password': 'password',
                                             'db_name': 'name',
                                             'bucket_name': 'bucket',
                                             'start_time': 'start',
                                         }), content_type='application/json')
        assert replay_response.status_code == 400

    def test_capture_connection_fails(self):
        self.app.capture_wrapper = successful_capture
        self.app.sql_connection_wrapper = unsuccessful_mysql_connection
        assert True


def successful_capture(*args, **kwargs):
    print("successful capture")
    return 1


def unsuccessful_capture(*args, **kwargs):
    return -1


def successful_mysql_connection(*args, **kwargs):
    print("successful mysql connection")
    return MockGoodConnection()


def unsuccessful_mysql_connection(*args, **kwargs):
    return MockBadConnection()


class MockGoodConnection:
    def __init__(self):
        self.open = True

    def close(self):
        pass


class MockBadConnection:
    def __init__(self):
        self.open = False

    def close(self):
        pass


if __name__ == '__main__':
    unittest.main()
