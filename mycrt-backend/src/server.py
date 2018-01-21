from flask import Flask, request, render_template, send_from_directory, session, json
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from flask_jsonpify import jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .metrics.metrics import get_metrics
from .capture.capture import capture
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

@app.route('/metrics', methods=['GET'])
def get_user_metrics():
	return jsonify(get_metrics())
