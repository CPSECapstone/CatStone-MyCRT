from flask import Flask, request, json, redirect, g
from .database.mycrt_database import db_session, init_db
from .database.models import User
from .database.user_repository import UserRepository
from flask_restful import Api
from flask_cors import CORS
from flask_jsonpify import jsonify
from flask_httpauth import HTTPBasicAuth
from .metrics.metrics import get_metrics
from .capture.capture import capture

from .capture.captureHelper import getS3Instances, getRDSInstances
from .capture.captureScheduler import checkAllRDSInstances
from .database.getRecords import getCaptureRDSInformation, getUserFromUsername, getUserFromEmail, getUsersCaptures

from flask_mail import Mail

from passlib.apps import custom_app_context as pwd_context
import time

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

@app.route('/test', methods=['GET'])
@auth.login_required
def get_test():
	return jsonify({'test': g.user.username}), 200

@app.route('/users', methods=['POST'])
def register_user():
    jsonData = request.get_json()

    if ('username' not in jsonData or
        'password' not in jsonData or
        'email' not in jsonData or
        'secret_key' not in jsonData or
        'access_key' not in jsonData):
            return jsonify({"error": "Missing field in request."}), 400
    if (getUserFromUsername(jsonData['username'])):
        return jsonify({"error": "User already exists."}), 400
    if (getUserFromEmail(jsonData['email'])):
        return jsonify({"error": "An account with this email already exists."}), 400

    username = jsonData['username']
    password = jsonData['password']
    email = jsonData['email']
    access_key = jsonData['access_key']
    secret_key = jsonData['secret_key']
    success = user_repository.register_user(username, password, email, access_key, secret_key)
    return str(201) if success else str(400)

@app.route('/users/captures/<id>', methods=['GET'])
@auth.login_required
def get_capture():
    userCapture = getCaptureRDSInformation(id)
    return jsonify({'capture': userCapture})

@app.route('/users/captures', methods=['GET'])
@auth.login_required
def get_users_captures():
    current_user = g.user

    checkAllRDSInstances()
    allCaptures = getUsersCaptures(current_user.username)

    return jsonify({"count": len(allCaptures), "userCaptures": allCaptures})

@app.route('/users/captures', methods=['POST'])
@auth.login_required
def post_capture():
    if request.headers['Content-Type'] == 'application/json':
        jsonData = request.json
        response = capture(jsonData['rds_endpoint'],
                jsonData['region_name'],
        	    jsonData['db_user'],
        	    jsonData['db_password'],
        	    jsonData['db_name'],
        	    jsonData['start_time'],
                jsonData['end_time'],
                jsonData['alias'],
                jsonData['bucket_name'])
        if (isinstance(response, int) and response > -1):
            return jsonify({'captureId': response}), 201
        else:
            return jsonify({'error': "Capture failed"}), 400

@app.route('/users/s3Buckets', methods=['GET'])
@auth.login_required
def get_s3_instances():
    response = getS3Instances()

    if (isinstance(response, list)):
        return jsonify({'count': len(response), 's3Instances': response}), 200

    return jsonify({'error': response['Error']['Code']}), response['ResponseMetaData']['HTTPStatusCode']


@app.route('/users/rdsInstances/<region_name>', methods=['GET'])
@auth.login_required
def get_rds_instances(region_name):
    response = getRDSInstances(region_name)

    if (isinstance(response, list)):
        return jsonify({'count': len(response), 'rdsInstances': response}), 200

    return jsonify({'error': response['Error']['Code']}), response['ResponseMetaData']['HTTPStatusCode'],


@app.route('/users/<captureId>/metrics', methods=["GET"])
@auth.login_required
def get_capture_metrics(captureId):
    metrics = {}
    availableMetrics = ['FreeableMemory', 'CPUUtilization', 'ReadIOPS', 'WriteIOPS']

    user_captures = getCaptureFromId(captureId)
    user_capture = user_captures[0]

    if (user_captures.length == 0):
        return str(404)
    elif (user_capture.userId != g.user.get_id()):
        return str(403)
    for metric in availableMetrics:
        metrics[metric] = get_metrics(metric, user_capture.captureAlias + '.metrics', user_capture.s3Bucket);

    return jsonify(metrics), 200

@auth.verify_password
def verify_password(username_or_token, password):
    user = User.verify_auth_token(username_or_token)
    if not user:
        user = user_repository.find_user_by_username(username_or_token)
        if not user or not user.verify_password(password):
            return False

    g.user = user
    return True

@app.route('/authenticate', methods=['GET'])
@auth.login_required
def login():
    token = g.user.generate_auth_token()
    return jsonify({ "token" : token.decode('ascii')})

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
