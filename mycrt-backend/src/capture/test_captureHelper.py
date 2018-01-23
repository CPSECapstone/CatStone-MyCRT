import unittest
from .mocking.mockBoto import mockBoto
from .captureHelper import getRDSInstances

class TestCaptureHelper(unittest.TestCase):

   def test_get_rds_instances_many(self):
      testBoto = mockBoto()
      response = getRDSInstances(testBoto)
      expected = ['test1', 'test2']

      self.assertEqual(response, expected)


if __name__ == '__main__':
   unittest.main()
