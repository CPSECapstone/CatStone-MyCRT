# To use a mysql DB change SQLALCHEMY_DATABASE_URI to
# 'mysql+pymysql://<user>:<password>@<ip_address>:<port>/<database_name>'
# Use the following if you want quick testing:
#  'sqlite:///test.db'
# For the above, <ip_address> can be localhost
# Uncomment the line below if you want to work with a local DB

# app configuration
DEBUG = True
TESTING = True
SECRET_KEY = 'my-secret-key'

# flask-security
#SECURITY_REGISTERABLE = False
SECURITY_PASSWORD_SALT = 'C1-J^Rzse:N`tO*<%`l+muT Ft03N( F`;e9s1)Ss}$_Cj!k;-;%=]P=1IDgGWhj'

# flask-mail
MAIL_SERVER='smtp.gmail.com'
MAIL_PORT=587
MAIL_USE_SSL=False
MAIL_USERNAME='username'
MAIL_PASSWORD='password'
MAIL_USE_TLS=True
DEFAULT_MAIL_SENDER='me'

SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:newpass@localhost/catdb'
SQLALCHEMY_TRACK_MODIFICATIONS=True
SQLALCHEMY_POOL_RECYCLE = 3600

WTF_CSRF_ENABLED = True
