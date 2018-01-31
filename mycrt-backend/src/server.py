from flask import Flask, request, json, redirect
from flask_security import Security, login_required
from .database.user_database import user_repository
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
user_datastore = user_repository.user_datastore
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

#Initialize the database
user_repository.init_db()

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

        newCapture = insertCapture(0, jsonData['alias'], jsonData['start_time'],
            jsonData['end_time'], jsonData['bucket_name'], jsonData['alias'] + ".log",
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

@app.route('/login-test', methods=['PUT'])
def login():
    user_repository.register_user(username="test-user", password="test123", email='test@test.com', access_key="test_access_key", secret_key="test_secret_key")


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

def find_user_by_username(username):
    return user_datastore.find_user(username=username)
