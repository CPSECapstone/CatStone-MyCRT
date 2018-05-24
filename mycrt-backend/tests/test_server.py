import os
from src.server import create_app
from src.database.mycrt_database import MyCrtDb
import unittest
import tempfile
from flask import json, Response
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
                data = json.dumps({
                    'username' : username,
                    'password' : password,
                    'email'    : email,
                    'access_key' : access_key,
                    'secret_key' : secret_key
                    }),
                content_type = 'application/json')

    def test_register_valid_user(self):
        username = 'test'
        password = 'test'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'

        result = self.register_user_request(username, password, email, access_key, secret_key)
        assert result.status_code  == 201

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

        captures = self.app.get('/users/captures', headers = {
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
                              headers = {
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
                              headers = {
                                  'Authorization': 'Basic %s' % b64encode(bytes(username + ":" + password, 'utf-8')).decode("ascii")})
        json_data = json.loads(result.data)
        token = json_data['token']

        s3_response = self.app.get('/users/s3Buckets', headers={
            'Authorization': 'Basic %s' % b64encode(bytes(token + ":" + '', 'utf-8')).decode("ascii")
        })
        s3_json = json.loads(s3_response.data)
        assert s3_response.status_code != 201
        assert 'error' in s3_json


if __name__ == '__main__':
    unittest.main()
