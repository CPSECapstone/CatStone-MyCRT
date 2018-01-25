# To use a mysql DB change SQLALCHEMY_DATABASE_URI to
# 'mysql+pymysql://<user>:<password>@<ip_address>:<port>/<database_name>'
# Use the following if you want quick testing:
#  'sqlite:///test.db'
# For the above, <ip_address> can be localhost
# Uncomment the line below if you want to work with a local DB

SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
SQLALCHEMY_TRACK_MODIFICATIONS=False
SQLALCHEMY_POOL_RECYCLE = 3600

WTF_CSRF_ENABLED = True