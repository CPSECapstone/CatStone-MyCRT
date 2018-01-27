from .dbConnector import db
from .models import *

db.create_all()

print("DB created")

def createDB():
    db.create_all()
    print("DB Created")

def deleteDB():
    db.drop_all()
    print("DB Deleted")