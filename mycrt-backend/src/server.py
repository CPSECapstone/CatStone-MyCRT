from flask import Flask, request, json
from flask_security import Security, login_required, SQLAlchemySessionUserDatastore
from src.database import db_session, init_db
from src.user.user import User, Role
from flask_restful import Api
from flask_cors import CORS
from flask_jsonpify import jsonify
from .metrics.metrics import get_metrics
from .capture.capture import capture
from flask_mail import Mail
from flask_login import LoginManager, current_user

#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"


# app configuration
app = Flask(__name__, static_url_path='')
app.config.from_envvar('MYCRT_SETTINGS')

# flask-security
user_datastore = SQLAlchemySessionUserDatastore(db_session, User, Role)
security = Security(app, user_datastore)

# flask-login
login_manager = LoginManager()
login_manager.init_app(app)

# flask-mail
mail = Mail(app)

# flask-cors
CORS(app)

# flask-restful
api = Api(app)

@app.before_first_request
def create_user():
    init_db()
    # this code can be used to create
    #user_datastore.create_user(username="test-user", password="test123", email='test@test.com', access_key="test_access_key", secret_key="test_secret_key")
    #db_session.commit()

@app.route('/')
@login_required
def home():
    # temp example on how to access current user
    return jsonify({'username': current_user.username,
                    'access_key': current_user.access_key,
                    'secret_key': current_user.secret_key})

@app.route('/test/api', methods=['GET'])
def get_test():
	return jsonify({'test': 'test'})

@app.route('/capture', methods=['POST'])
def post_capture():
    if request.headers['Content-Type'] == 'application/json':
        print("JSON Message: " + json.dumps(request.json))
        print("-----JSON OBJ -------")
        jsonData = request.json

        capture(jsonData["region"],
        	    jsonData["rdsInstance"],
        	    jsonData["logFile"],
        	    jsonData["localLogFile"],
        	    jsonData["bucketName"])


    return jsonify("{'capture_status': 'running'}")

@app.route('/login', methods=['PUT', 'GET'])
def login():
    if request.headers['Content-Type'] == 'application/json':
        print("JSON Message: " + json.dumps(request.json))
        print("------ JSON OBJ -------")
        jsonData = request.json
        print(jsonData)

        #Call login method here verifies/authenticates user

    return jsonify("{'login_status': 'Success'}")


@app.route('/metrics', methods=['GET'])
def get_user_metrics():
	return jsonify(get_metrics())

@login_manager.user_loader
def load_user(user_id):
    return user_datastore.find_user(id=user_id)
