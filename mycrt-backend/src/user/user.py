from src.database.user_database import Base
from flask_security import UserMixin, RoleMixin
from sqlalchemy.orm import relationship, backref
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey

class RolesUsers(Base):
    __tablename__ = 'roles_users'
    id = Column(Integer, primary_key = True)
    user_id = Column('user_id', Integer(), ForeignKey('user.userId'))
    role_id = Column('role_id', Integer(), ForeignKey('role.id'))

class Role(Base, RoleMixin):
    __tablename__ = 'role'
    id = Column(Integer, primary_key = True)
    name = Column(String(80), unique=True)
    description = Column(String(255))

class User(Base, UserMixin):
    __tablename__ = 'user'
    userId = Column(Integer, primary_key=True)
    username = Column(String(128), unique=True, nullable=False)
    userPassword = Column(String(80), nullable=False)
    email = Column(String(128), unique=True)
    accessKey= Column(String(128), nullable=False)
    secretKey = Column(String(128), nullable=False)
    active = Column(Boolean())
    notificationLife = Column(Integer())
    roles = relationship('Role', secondary='roles_users',
            backref=backref('users', lazy='dynamic'))

    def __repr__(self):
        return '<User %r %r %r %r %r %r' % (self.username, self.userPassword, self.email, self.accessKey, self.secretKey, self.notificationLife)

    def is_authenticated(self):
        return True

    def is_active(self):
        return self.active

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.userId
