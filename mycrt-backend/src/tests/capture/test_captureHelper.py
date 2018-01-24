import unittest
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
from tests.mocking.mockBoto import mockBoto
from capture.captureHelper import getRDSInstances, getS3Instances

class TestCaptureHelper(unittest.TestCase):
    def test_get_rds_instances_many(self):
        testBoto = mockBoto(0)
        response = getRDSInstances(testBoto)
        expected = []

        self.assertEqual(response, expected)

    def test_get_rds_instances_singular(self):
        testBoto = mockBoto(1)
        response = getRDSInstances(testBoto)
        expected = ['test1']

        self.assertEqual(response, expected)

    def test_get_rds_instances_many(self):
        testBoto = mockBoto(2)
        response = getRDSInstances(testBoto)
        expected = ['test1', 'test2']

        self.assertEqual(response, expected)

    def test_get_s3_instances_singular(self):
        testBoto = mockBoto(1)
        response = getS3Instances(testBoto)
        expected = ['testBucket1']

        self.assertEqual(response, expected)

if __name__ == '__main__':
   unittest.main()
