from src.database.models import User


class UserRepository:

    def __init__(self, db_session):
        self.db_session = db_session

    def register_user(self, username, password, email, access_key, secret_key):
        if User.query.filter(User.username==username).first() is None:
            user = User(username=username,
                    email=email, access_key=access_key, secret_key=secret_key)
            user.hash_password(password)
            self.db_session.add(user)
            self.db_session.commit()
            return True
        else:
            return False

    def find_user_by_username_and_password(self, username, password):
        user = User.query.filter(User.username==username).first()
        if user != None and user.verify_password(password, user.password):
            return user
        else:
            return None

    def find_user_by_username(self, username):
        return User.query.filter(User.username==username).first()
