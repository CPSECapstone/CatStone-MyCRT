'''
 @author Andrew Ly

 This allows us to get the database connection

'''
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

application = Flask(__name__)
application.config.from_object('config')
db = SQLAlchemy(application)