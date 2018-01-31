from flask import Flask, request, json, redirect
from flask_security import Security, login_required, SQLAlchemySessionUserDatastore
from .database.user_database import db_session, init_db
from .database.user import User, Role
from flask_restful import Api
from flask_cors import CORS
from flask_jsonpify import jsonify
from .metrics.metrics import get_metrics
from .capture.capture import capture

from .capture.captureHelper import getS3Instances, getRDSInstances
from .database.getRecords import *
from .database.addRecords import *

from flask_mail import Mail
from flask_login import LoginManager, current_user

#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"


# app configuration
app = Flask(__name__, static_url_path='')
app.config.from_object('config')

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
    # this code can be used to create a test user
    if find_user_by_email("test@test.com") == None:
        print("User found")
        user_datastore.create_user(username="test-user", password="test123", email='test@test.com', access_key="test_access_key", secret_key="test_secret_key")
        db_session.commit()

@app.route('/')
def home():
    # temp example on how to access current user
    if current_user.is_authenticated:
        return jsonify({'username': current_user.username,
                    'access_key': current_user.access_key,
                    'secret_key': current_user.secret_key})
    else:
        return 'Not logged in'


@app.route('/test/api', methods=['GET'])
def get_test():
	return jsonify({'test': 'test'})

@app.route('/capture', methods=['GET'])
def get_capture():
    jsonData = request.json
    newCapture = getCaptureRDSInformation(jsonData[captureId])
    return jsonify(newCapture)

@app.route('/capture', methods=['POST'])
def post_capture():
    if request.headers['Content-Type'] == 'application/json':
        print("JSON Message: " + json.dumps(request.json))
        print("-----JSON OBJ -------")
        jsonData = request.json
        response = capture(jsonData['rds_endpoint'],
        	    jsonData['db_user'],
        	    jsonData['db_password'],
        	    jsonData['db_name'],
        	    jsonData['start_time'],
                jsonData['end_time'],
                jsonData['alias'],
                jsonData['bucket_name'])

        newCapture = Capture(0, jsonData['alias'], jsonData['start_time'],
            jsonData['end_time'], jsonData['bucket_name'], jsonData['alias'],
            jsonData['rds_endpoint'], jsonData['db_user'], jsonData['db_password'],
            jsonData['db_name'])

        if (isinstance(response, int)):
            return jsonify({'status': 201})
        else:
            return jsonify({'status': 400, 'Error': response})


@app.route('/s3', methods=['GET'])
def get_s3_instances():
    response = getS3Instances()

    if (isinstance(response, list)):
        return jsonify({'status': 200, 'count': len(response), 's3Instances': response})

    return jsonify({'status': response['ResponseMetaData']['HTTPStatusCode'], 'error': response['Error']['Code']})


@app.route('/rds', methods=['GET'])
def get_rds_instances():
    response = getRDSInstances()
    if (isinstance(response, list)):
        return jsonify({'status': 200, 'count': len(response), 'rdsInstances': response})

    return jsonify({'status': response['ResponseMetaData']['HTTPStatusCode'], 'error': response['Error']['Code']})

@app.route('/User', methods=['POST'])
def register_user():
	jsonData = request.json
	errList = []

	if (!getUserFromUsername(jsonData['user_name'])):
		errList.append("User already exists.")
	if (!getUserFromEmail(jsonData['user_email']))
		errList.append("An account with this email already exists.")
	if (errList):
		return jsonify({'status': 400, 'errors': errList})
	else:
		newUser = insertUser(jsonData['user_name'], jsonData['user_password'],
			jsonData['user_email'], jsonData['user_accessKey'], jsonData['user_secretKey']
		return jsonify({'status': 201, 'user': jsonify(newUser)})


@app.route('/login', methods=['PUT', 'GET'])
def login():
    if request.headers['Content-Type'] == 'application/json':
        print("JSON Message: " + json.dumps(request.json))
        print("------ JSON OBJ -------")
        jsonData = request.json
        print(jsonData)

        #Call login method here verifies/authenticates user

    return jsonify("{'login_status': 'Success'}")

@login_required
@app.route('/logout', methods=['POST'])
def logout():
    login_manager.logout_user(current_user)
    return redirect('/', code=302)

@app.route('/metrics', methods=['GET'])
def get_user_metrics():
	return jsonify(get_metrics())

@login_manager.user_loader
def load_user(user_id):
    return user_datastore.find_user(id=user_id)

def find_user_by_email(email):
    return user_datastore.find_user(email=email)
