import unittest
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
from tests.mocking.mockBoto import mockBoto
from capture.captureHelper import getRDSInstances, getS3Instances

class TestCaptureHelper(unittest.TestCase):

   def test_get_rds_instances_many(self):
      testBoto = mockBoto()
      response = getRDSInstances(testBoto)
      expected = ['test1', 'test2']

      self.assertEqual(response, expected)

   def test_get_s3_instances_many(self):
      testBoto = mockBoto()
      response = getS3Instances(testBoto)
      expected = ['testBucket1', 'testBucket2']

      self.assertEqual(response, expected)


if __name__ == '__main__':
   unittest.main()
