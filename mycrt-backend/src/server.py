from flask import Flask, request, json, redirect
from flask_security import Security, login_required
from flask_security.utils import verify_password
from .database.mycrt_database import db
from flask_restful import Api
from flask_cors import CORS
from flask_jsonpify import jsonify
from .metrics.metrics import get_all_metrics
from .capture.capture import capture

from .capture.captureHelper import getS3Instances, getRDSInstances
from .database.getRecords import *
from .database.addRecords import *

from flask_mail import Mail
from flask_login import LoginManager, current_user, login_user

#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"


# app configuration
app = Flask(__name__, static_url_path='')
app.config.from_object('config')

# flask-security
user_datastore = db.user_datastore
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

@app.route('/')
def home():
    # temp example on how to access current user
    if current_user.is_authenticated:
        return jsonify({ 'authenticated' : True }), 200
    else:
        return jsonify({ 'authenticated' : False }), 200


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

@login_manager.request_loader
def load_user_from_request(request):
    auth = request.authorization
    if auth:
        username = auth.username
        password = auth.password
        user = user_datastore.find_user(username=username)
        if user is not None and verify_password(password, user.password):
            return user
    return None

@app.route('/login', methods=['POST'])
def login():
    user = current_user
    if user is not None:
        login_user(user)
        return 200
    else:
        return 400

@login_required
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
<<<<<<< HEAD
    access_key = jsonData['access_key']    
    secret_key = jsonData['secret_key']
    
=======
    access_key = jsonData['access_key']
    secret_key = jsonData['secret_key']

>>>>>>> 0d0f1a3c0c891037c02415fae8632e294579e85e
    success = db.register_user(username, password, email, access_key, secret_key)
    return jsonify({"status" : 201 if success else 400 })

@login_required
@app.route('/users/captures', methods=['GET'])
def get_users_captures():
    if request.headers['Content-Type'] == 'application/json':
        response = getAllCaptures(current_user.username)
        return jsonify({'status': 200, 'count': len(response), 'userCaptures': Capture.convertToDict(response)})

@app.route('/metrics', methods=['GET'])
def get_user_metrics():
	return jsonify(get_metrics())

@app.before_first_request
def add_test_users():
    '''This method adds a user for testing purposes when the server starts up.
    This happens the first time the server gets a request.
    '''
    db.register_user('test-user', 'password123', 'test@test.com',
                        'test-access-key', 'test-secret-key')

@login_manager.user_loader
def load_user(user_id):
    return user_datastore.find_user(id=user_id)

def find_user_by_email(email):
    return user_datastore.find_user(email=email)

def find_user_by_username(username):
    return user_datastore.find_user(username=username)
