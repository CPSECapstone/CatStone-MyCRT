import unittest
from .capture import capture
class TestSample(unittest.TestCase):
   """
   Our basic test class
   """

   def test_log_download(self):
      """
      The actual test.
      Any method which starts with ''test_'' will be considered as a test case.
      """

      region = 'us-west-1'
      rds_instance = 'testdb'
      log_file = 'general/mysql-general.log'
      local_log_file = 'log'
      bucket_name = 'crt-bucket'

      res = capture(region, rds_instance, log_file, local_log_file, bucket_name)

      self.assertEqual(res, 1)

if __name__ == '__main__':
   unittest.main()
