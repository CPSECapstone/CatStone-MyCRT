from flask import Flask, request, json, redirect
from .database.mycrt_database import db_session, init_db
from .database.models import User
from .database.user_repository import UserRepository
from flask_restful import Api
from flask_cors import CORS
from flask_jsonpify import jsonify
from flask_httpauth import HTTPBasicAuth
from .metrics.metrics import get_all_metrics
from .capture.capture import capture

from .capture.captureHelper import getS3Instances, getRDSInstances
from .database.getRecords import *
from .database.addRecords import *

from flask_mail import Mail

#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"


# app configuration
app = Flask(__name__, static_url_path='')
app.config.from_object('config')

init_db()
user_repository = UserRepository(db_session)

# flask-mail
mail = Mail(app)

# flask-cors
CORS(app)

# flask-restful
api = Api(app)
auth = HTTPBasicAuth()

@app.route('/')
def home():
    return jsonify({ 'message' : 'hello'}), 200


@app.route('/test/api', methods=['GET'])
def get_test():
	return jsonify({'test': 'test'})

@app.route('/capture', methods=['GET'])
def get_capture():
    jsonData = request.json
    newCapture = getCaptureRDSInformation(jsonData[captureId])
    return jsonify(newCapture)

@login_required
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

        if (isinstance(response, int) and response > -1):
            return jsonify({'status': 201, 'captureId': response})
        else:
            return jsonify({'status': 400})

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

def load_user_from_request(request):
    auth = request.authorization
    if auth:
        username = auth.username
        password = auth.password
        user = user_repository.find_user(username=username)
        if user is not None and user.verify_password(password):
            return user
    return None

@auth.verify_password
def verify_password(username_or_token, password):
    user = User.verify_auth_token(username_or_token)
    if not user:
        user = user_repository.find_user_by_username(username_or_token)
        return user and user.verify_password(password)
    return True

@app.route('/authenticate', methods=['POST'])
@auth.login_required
def login():
    user = current_user
    if user is not None:
        login_user(user)
        return 200
    else:
        return 400

@app.route('/logout', methods=['POST'])
def logout():
    login_manager.logout_user(current_user)
    return redirect('/', code=302)

@app.route('/user', methods=['POST'])
def register_user():
    jsonData = request.get_json()

    if ('username' not in jsonData or
        'password' not in jsonData or
        'email' not in jsonData or
        'secret_key' not in jsonData or
        'access_key' not in jsonData):
            return jsonify({"status": 400, "error": "Missing field in request."})
    if (getUserFromUsername(jsonData['username'])):
        return jsonify({"status": 400, "error": "User already exists."})
    if (getUserFromEmail(jsonData['email'])):
        return jsonify({"status": 400, "error": "An account with this email already exists."})

    username = jsonData['username']
    password = jsonData['password']
    email = jsonData['email']
    access_key = jsonData['access_key']
    secret_key = jsonData['secret_key']
    success = user_repository.register_user(username, password, email, secret_key, access_key)
    return jsonify({"status" : 201 if success else 400 })

@login_required
@app.route('/users/captures', methods=['GET'])
def get_users_captures():
    if request.headers['Content-Type'] == 'application/json':
        response = getAllCaptures(current_user.username)
        return jsonify({'status': 200, 'count': len(response), 'userCaptures': Capture.convertToDict(response)})

@app.route('/metrics', methods=['GET'])
def get_user_metrics():
	return jsonify(get_all_metrics())

@app.before_first_request
def add_test_users():
    '''This method adds a user for testing purposes when the server starts up.
    This happens the first time the server gets a request.
    '''
    user_repository.register_user('test-user', 'password123', 'test@test.com',
                        'test-access-key', 'test-secret-key')

def find_user_by_email(email):
    return user_repository.find_user_by_email(email=email)

def find_user_by_username(username):
    return user_repository.find_user_by_username(username=username)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()
