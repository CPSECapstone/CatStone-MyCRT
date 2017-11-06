import unittest

class TestSample(unittest.TestCase):
   """
   Our basic test class
   """
   
   def test_simple(self):
      """ 
      The actual test.
      Any method which starts with ''test_'' will be considered as a test case.
      """

      res = 1
      self.assertEqual(res, 1)


if __name__ == '__main__':
   unittest.main()
