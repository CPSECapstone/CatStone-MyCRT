from flask import Flask, request, render_template, send_from_directory, session, json
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from flask_jsonpify import jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .metrics.metrics import get_metrics
from .capture.capture import capture
from .capture.captureHelper import getS3Instances, getRDSInstances
#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"
app = Flask(__name__, static_url_path='')
CORS(app)
api = Api(app)
login_manager = LoginManager()
login_manager.init_app(app)

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

@app.route('/s3', methods=['GET'])
def get_s3_instances():
    response = getS3Instances()

    if (isinstance(response, int)):
        return jsonify({'status': response['ResponseMetaData']['HTTPStatusCode'], 'error': response['Error']['Code']})

    return jsonify({'status': 200, 'count': len(response), 's3Instances': response})

@app.route('/rds', methods=['GET'])
def get_rds_instances():
    response = getRDSInstances()
    if (isinstance(response, int)):
        return jsonify({'status': response['ResponseMetaData']['HTTPStatusCode'], 'error': response['Error']['Code']})

    return jsonify({'status': 200, 'count': len(response), 'rdsInstances': response})

@app.route('/login', methods=['PUT'])
def login():
    if request.headers['Content-Type'] == 'application/json':
        print("JSON Message: " + json.dumps(request.json))
        print("------ JSON OBJ -------")
        jsonData = request.json

        #Call login method here verifies/authenticates user

    return jsonify("{'login_status': 'Success'}")

@app.route('/metrics', methods=['GET'])
def get_user_metrics():
	return jsonify(get_metrics())
