from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

class MyCrtDb:
    Base = declarative_base()

    def __init__(self, db_string):
        self.engine = create_engine(db_string, convert_unicode=True)
        self.db_session = scoped_session(sessionmaker(autocommit=False,
            autoflush=False, bind=self.engine))

        MyCrtDb. Base.query = self.db_session.query_property()
        from src.database.models import User, Notification, Capture, Replay, ScheduledQuery, Metric
        self.Base.metadata.create_all(bind=self.engine)

    def get_session(self):
        return self.db_session

    def dispose_engine(self):
        self.engine.dispose()