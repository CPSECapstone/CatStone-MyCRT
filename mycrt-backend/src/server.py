from flask import Flask, request, render_template, send_from_directory, session
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from json import dumps
from flask_jsonpify import jsonify

#PROJECT_ROOT = os.path.abspath(os.pardir)
#REACT_DIR = PROJECT_ROOT + "\help-react\src"
app = Flask(__name__, static_url_path='')
CORS(app)
api = Api(app)

@app.route('/test/api', methods=['GET'])
def get_test():
	return jsonify({'test': 'test'})