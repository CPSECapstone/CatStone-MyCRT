from src.user.user import User
import unittest


class TestUser(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_user_created(self):
        username = "test_user"
        userPassword = "test_password"
        accessKey = "access_key"
        secretKey = "secret_key"

        user = User(username=username, userPassword=userPassword,
                accessKey=accessKey, secretKey=secretKey)
        assert username == user.username
        assert userPassword == user.userPassword
        assert accessKey == user.accessKey
        assert secretKey == user.secretKey


if __name__ == '__main__':
   unittest.main()
