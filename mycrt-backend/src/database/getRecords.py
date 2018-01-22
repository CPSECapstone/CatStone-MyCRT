import pymysql

from dbConnector import getConn

def getAllCaptures(username):
	with getConn().cursor() as cur:
		cur.execute("""Select Users.userId, captureAlias, startTime, endTime, rdsInstance 
				       FROM Users JOIN Captures ON Users.userId = Captures.userId WHERE userName = %s""",
				    (username))
		return cur.fetchall()

def getUserEmail(username):
	with getConn().cursor() as cur:
		cur.execute("""Select email FROM Users WHERE username = %s""",
			        (username))
		return cur.fetchall()

def getCaptureRDSInformation(captureAlias):
	with getConn().cursor() as cur:
		cur.execute("""Select rdsInstance, rdsUsername, rdsPassword, rdsDatabase
			           FROM Captures WHERE captureAlias = %s""",
			        (captureAlias))
		return cur.fetchall()