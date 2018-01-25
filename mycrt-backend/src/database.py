from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# figure out a way to pass in the db string
engine = create_engine('mysql://mycrt:catstone@localhost/mycrt_development', convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # import any sqlalchemy models so they can be exported
    import src.user
    Base.metadata.create_all(bind=engine)
