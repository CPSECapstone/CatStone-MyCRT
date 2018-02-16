import os
from src.server import app
from src.database.mycrt_database import init_db
import unittest
import tempfile
from flask import json

class TestServer(unittest.TestCase):

    def setUp(self):
        self.db_fd,  self.temp_file = tempfile.mkstemp()
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + self.temp_file
        app.testing = True
        self.app = app.test_client()
        with app.app_context():
            init_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.temp_file)

    def test_login_without_credentials(self):
        result = self.app.get('/authenticate')
        assert b'Unauthorized' in result.data

    def test_register_user(self):
        username = 'test'
        password = 'test'
        email = 'unittest@test.com'
        access_key = 'test_key'
        secret_key = 'test_key'

        result = self.app.post('/user',
                data = json.dumps({
                    'username' : username,
                    'password' : password,
                    'email'    : email,
                    'access_key' : access_key,
                    'secret_key' : secret_key
                    }),
                content_type = 'application/json')
        json_data = json.loads(result.data)
        assert json_data['status'] == 201

    def test_login_with_credentials(self):
        result = self.app.get('/authenticate',
                headers={'username':'test-user', 'password':'password123'})
        assert b'Unauthorized' in result.data

if __name__ == '__main__':
    unittest.main()
