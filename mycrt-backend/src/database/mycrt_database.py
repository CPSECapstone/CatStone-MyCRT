from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password, verify_password

from .base import Base
from .user import User, Role, RolesUsers
import src.database.models

from .db_config import db_string

class UserRepository:

    def __init__(self, db_string):
        self.engine = create_engine(db_string, convert_unicode=True)
        self.db_session = scoped_session(sessionmaker(autocommit=False,
            autoflush=False, bind=self.engine))

        Base.query = self.db_session.query_property()
        self.user_datastore = SQLAlchemySessionUserDatastore(
                self.db_session, User, Role)
        Base.metadata.create_all(bind=self.engine)

    def register_user(self, username, password, email, access_key, secret_key):
        if self.user_datastore.find_user(username=username) == None and \
            self.user_datastore.find_user(email=email) == None:
            self.user_datastore.create_user(username=username, password=hash_password(password),
                    email=email, access_key=access_key, secret_key=secret_key)
            self.user_datastore.commit()
            return True
        else:
            return False

    def find_user_by_username_and_password(self, username, password):
        user = self.user_datastore.find_user(username=username)
        if user != None and verify_password(password, user.password):
            return user
        else:
            return None

db = UserRepository(db_string)
