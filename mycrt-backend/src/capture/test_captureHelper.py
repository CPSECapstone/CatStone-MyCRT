import unittest
import os
import sys

from .mocking.mockBoto import mockBoto
from .captureHelper import getRDSInstances

class TestCaptureHelper(unittest.TestCase):
   """
   Testing for the CaptureHelper
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
