# To use a mysql DB change SQLALCHEMY_DATABASE_URI to
# 'mysql+pymysql://<user>:<password>@<ip_address>:<port>/<database_name>'
# Use the following if you want quick testing:
#  'sqlite:///test.db'
# For the above, <ip_address> can be localhost

# app configuration
DEBUG = True
TESTING = True
SECRET_KEY = 'my-secret-key'


SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root@localhost:3306/catdb'
SQLALCHEMY_TRACK_MODIFICATIONS=True
SQLALCHEMY_POOL_RECYCLE = 3600

WTF_CSRF_ENABLED = True