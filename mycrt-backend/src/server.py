from flask import Flask, request, render_template, send_from_directory, session, json
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from flask_jsonpify import jsonify
from .metrics.metrics import get_metrics
from .capture.capture import capture
from .capture.captureHelper import getS3Instances, getRDSInstances
from .database.getRecords import *
from .database.addRecords import *

#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"
app = Flask(__name__, static_url_path='')
CORS(app)
api = Api(app)

@app.route('/test/api', methods=['GET'])
def get_test():
	return jsonify({'test': 'test'})

@app.route(/'capture', methods=['GET'])
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
