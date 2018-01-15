'''
 @author Andrew Ly

 This allows us to get the database connection

'''
import pymysql

__all__ = ['getConn']

#Change the host, user, passwd, and db fields as necessary for your database
def connect():
	return pymysql.connect(host='CHANGE VALUES',
		                   user='CHANGE VALUES',
		                   passwd='CHANGE VALUES',
		                   db='CHANGE VALUES',
		                   cursorclass=pymysql.cursors.DictCursor)

def getConn():
    global conn

    try:
	    conn.ping(True)
    except:
	    conn = connect()

    return conn

conn = connect()
