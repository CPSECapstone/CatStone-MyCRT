import os
from src.server import create_app
from src.database.mycrt_database import MyCrtDb
import unittest
import tempfile
from flask import json
from base64 import b64encode
from requests.auth import HTTPBasicAuth

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
        assert b'Unauthorized' in result.data

    def register_user_request(self, username, password, email, access_key, secret_key):
        ''' Helper method for making a register request
        '''
        return self.app.post('/user',
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
        json_data = json.loads(result.data)
        assert json_data['status'] == 201

    def test_login_with_credentials(self):
        username = 'test'
        password = 'password'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'
        self.register_user_request(username, password, email, access_key, secret_key)
        result = self.app.get('/authenticate',
                headers = {
                    'Authorization': 'Basic %s' % b64encode(bytes(username + ":" +  password, 'utf-8')).decode("ascii")})
        print(result.data)
        assert b'Unauthorized' in result.data



if __name__ == '__main__':
    unittest.main()
