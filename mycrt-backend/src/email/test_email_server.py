import unittest
from email_server import email
class TestSample(unittest.TestCase):
   """
   Our basic test class
   """
   
   def test_positive_email(self):
      """ 
      The actual test.
      Any method which starts with ''test_'' will be considered as a test case.
      """
      res = email('aly16@calpoly.edu', 'Test Status: Complete', 'Status Complete')
      
      self.assertEqual(res, 0)


if __name__ == '__main__':
   unittest.main()
