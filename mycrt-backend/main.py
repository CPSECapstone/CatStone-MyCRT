from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

from src.server import socketio, app


if __name__ == '__main__':
    socketio.run(app)
