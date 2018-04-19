import unittest
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
from tests.mocking.mockBoto import mockBoto
from tests.mocking.mockUser import MockUser
from src.replay.replay import get_transactions

class TestReplay(unittest.TestCase):
    def setUp(self):
        self.user = MockUser('my_access_key', 'my_secret_key')

    def test_get_transactions(self):
        testBoto = mockBoto(0)
        response = get_transactions("test_alias", "test_bucket", self.user, testBoto)
        expected = {'Error': {'Code': '400', 'Message': 'Generic Error'}}

        self.assertEqual(response, expected)

if __name__ == '__main__':
   unittest.main()