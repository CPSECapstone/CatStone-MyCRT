import unittest
from passlib.apps import custom_app_context as pwd_context

class TestHash(unittest.TestCase):
    def test_verify_hash(self):
        password = "secret password"
        hashed = pwd_context.hash(password)
        assert pwd_context.verify(password, hashed)

if __name__ == '__main__':
    unittest.main()
