import unittest
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
from tests.mocking.mockBoto import mockBoto
from capture.captureHelper import getRDSInstances

class TestCaptureHelper(unittest.TestCase):
   """
   Our basic test class
   """

   def test_get_rds_instances_many(self):
      """
      The actual test.
      Any method which starts with ''test_'' will be considered as a test case.
      """
      testBoto = mockBoto()
      response = getRDSInstances(testBoto)
      expected = ['test1', 'test2']

      self.assertEqual(response, expected)


if __name__ == '__main__':
   unittest.main()
