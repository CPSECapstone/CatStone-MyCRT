from src.user.user import User
import unittest


class TestUser(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_user_created(self):
        username = "test_user"
        password = "test_password"
        access_key = "access_key"
        secret_key = "secret_key"

        user = User(username=username, password=password,
                access_key=access_key, secret_key=secret_key)
        assert username == user.username
        assert password == user.password
        assert access_key == user.access_key
        assert secret_key == user.secret_key


if __name__ == '__main__':
   unittest.main()
