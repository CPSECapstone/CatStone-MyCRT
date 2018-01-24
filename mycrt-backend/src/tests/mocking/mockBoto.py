import datetime
from dateutil.tz import tzutc
from botocore.exceptions import NoRegionError, ClientError

class mockBoto:
    def __init__(self, testNum):
        self.testNum = testNum

    class mockRDS0:
        def describe_db_instances(self):
            exampleResponse = {
                'ResponseMetadata': {
                'HTTPStatusCode': 200, 'RequestId': '28ce93d0-ed9d-4999-a067-fa1e91fa294e', 'HTTPHeaders': {
                    'content-type': 'text/xml', 'x-amzn-requestid': '28ce93d0-ed9d-4999-a067-fa1e91fa294e', 'vary': 'Accept-Encoding', 'content-length': '7680', 'date': 'Mon, 22 Jan 2018 23:16:30 GMT'},
                    'RetryAttempts': 0
                },
                'DBInstances': []
            }
            return exampleResponse

    class mockRDS1:
        def describe_db_instances(self):
            exampleResponse = {
                'ResponseMetadata': {
                'HTTPStatusCode': 200, 'RequestId': '28ce93d0-ed9d-4999-a067-fa1e91fa294e', 'HTTPHeaders': {
                    'content-type': 'text/xml', 'x-amzn-requestid': '28ce93d0-ed9d-4999-a067-fa1e91fa294e', 'vary': 'Accept-Encoding', 'content-length': '7680', 'date': 'Mon, 22 Jan 2018 23:16:30 GMT'},
                    'RetryAttempts': 0
                },
                'DBInstances': [{
                    'DBInstanceIdentifier': 'test1'
                    }]
            }
            return exampleResponse
    class mockRDS2:
        def describe_db_instances(self):
            exampleResponse = {
                'ResponseMetadata': {
                'HTTPStatusCode': 200, 'RequestId': '28ce93d0-ed9d-4999-a067-fa1e91fa294e', 'HTTPHeaders': {
                    'content-type': 'text/xml', 'x-amzn-requestid': '28ce93d0-ed9d-4999-a067-fa1e91fa294e', 'vary': 'Accept-Encoding', 'content-length': '7680', 'date': 'Mon, 22 Jan 2018 23:16:30 GMT'},
                    'RetryAttempts': 0
                },
                'DBInstances': [{
                    'DBInstanceIdentifier': 'test1'
                    }, {
                    'DBInstanceIdentifier': 'test2',
                    }]
            }
            return exampleResponse
    class mockRDS3:
        def describe_db_instances(self):

    class mockS3:
        def list_buckets(self):
            exampleResponse = {
            'Owner': {
                'DisplayName': 'agupta09', 'ID': 'fb58bd8602028b21eb564ccb2743c44481d96f9f999bc480ed1854dd977236f0'},
                'Buckets': [{'CreationDate': datetime.datetime(2017, 11, 27, 4, 53, tzinfo=tzutc()), 'Name': 'testBucket1'}],
                'ResponseMetadata': {'RequestId': '173A70D1BF9097D9', 'RetryAttempts': 0,
                'HTTPHeaders': {'server': 'AmazonS3', 'x-amz-request-id': '173A70D1BF9097D9', 'transfer-encoding': 'chunked', 'content-type': 'application/xml', 'x-amz-id-2': 'wmqbidko+5fBcotqbVhY+mNcCGE/9z+QoU5xMs4Y/tpzI6BX8trQi+72jgkBqavHVQNN61Cpooc=', 'date': 'Tue, 23 Jan 2018 02:52:17 GMT'}, 'HostId': 'wmqbidko+5fBcotqbVhY+mNcCGE/9z+QoU5xMs4Y/tpzI6BX8trQi+72jgkBqavHVQNN61Cpooc=', 'HTTPStatusCode': 200}
            }
            return exampleResponse

    def client(self, awsApplication):
        if (awsApplication == 'rds'):
            if (self.testNum == 0):
                return self.mockRDS0()
            elif (self.testNum == 1):
                return self.mockRDS1()
            elif (self.testNum == 2):
                return self.mockRDS2()
            elif (self.testNum == 3):
                return self.mockRDS3()
            return self.mockRDS0()
        elif (awsApplication == 's3'):
            return self.mockS3()
