import pymysql
import os

from flask import Flask, request, g, Response
from .database.mycrt_database import MyCrtDb
from .database.models import User
from .database.user_repository import UserRepository
from flask_restful import Api
from flask_cors import CORS
from flask_jsonpify import jsonify
from flask_httpauth import HTTPBasicAuth
from pymysql import OperationalError, MySQLError
from .metrics.metrics import get_metrics
from .capture.capture import capture
from .replay.replay import replay, prepare_scheduled_replay

from .capture.captureHelper import getS3Instances, getRDSInstances
from .capture.captureScheduler import checkAllRDSInstances

from .database.getRecords import *
from .database.addRecords import insertReplay

from multiprocessing import Process

def create_app(config={}):
    # app configuration
    app = Flask(__name__, static_url_path='')
    app.config.from_object('config')
    app.config.update(config)

    db = MyCrtDb(app.config['SQLALCHEMY_DATABASE_URI'])
    user_repository = UserRepository(db.get_session())

    # flask-cors
    CORS(app)

    # flask-restful
    api = Api(app)
    auth = HTTPBasicAuth()


    @app.route('/test', methods=['GET'])
    @auth.login_required
    def get_test():
        return jsonify({'test': g.user.username})

    @app.route('/users', methods=['POST'])
    def register_user():
        jsonData = request.get_json()

        if ('username' not in jsonData or
            'password' not in jsonData or
            'email' not in jsonData or
            'secret_key' not in jsonData or
            'access_key' not in jsonData):
                return jsonify({"error": "Missing field in request."}), 400
        if (getUserFromUsername(jsonData['username'], db.get_session())):
            return jsonify({"error": "User already exists."}), 400
        if (getUserFromEmail(jsonData['email'], db.get_session())):
            return jsonify({"error": "An account with this email already exists."}), 400

        username = jsonData['username']
        password = jsonData['password']
        email = jsonData['email']
        access_key = jsonData['access_key']
        secret_key = jsonData['secret_key']
        success = user_repository.register_user(username, password, email, access_key, secret_key)
        if (not success):
            return jsonify(), 400

        return jsonify(), 201

    @app.route('/users/captures/<capture_id>', methods=['GET'])
    @auth.login_required
    def get_capture(capture_id):
        userCaptures = getCaptureFromId(capture_id, db.get_session())
        if (len(userCaptures) == 0):
            return jsonify(), 404

        userCapture = userCaptures[0]
        if (userCapture['userId'] != g.user.get_id()):
            return jsonify(), 403

        return jsonify(userCapture), 200

    @app.route('/users/captures', methods=['GET'])
    @auth.login_required
    def get_users_captures():
        current_user = g.user

        checkAllRDSInstances(current_user, db.get_session())
        allCaptures = getUsersCaptures(current_user.username, db.get_session())

        return jsonify({"count": len(allCaptures), "userCaptures": allCaptures})

    @app.route('/users/captures', methods=['POST'])
    @auth.login_required
    def post_capture():
        if request.headers['Content-Type'] == 'application/json':
            jsonData = request.json

            if ('rds_endpoint' not in jsonData or
                'region_name' not in jsonData or
                'db_user' not in jsonData or
                'db_password' not in jsonData or
                'db_name' not in jsonData or
                'start_time' not in jsonData or
                'end_time' not in jsonData or
                'alias' not in jsonData or
                'bucket_name' not in jsonData):
                    return jsonify({"error": "Missing field in request."}), 400

            if (len(getReplayFromAlias(jsonData['alias'], db.get_session())) != 0 or
                len(getCaptureFromAlias(jsonData['alias'], db.get_session())) != 0):
                return jsonify({"error": "Alias is unavailable."}), 400

            try:
                connection = pymysql.connect(jsonData['rds_endpoint'], user=jsonData['db_user'], passwd=jsonData['db_password'], db=jsonData['db_name'], connect_timeout=5)
                queries = []

                if connection.open:
                    connection.close()
            except OperationalError as e:
                return jsonify({'error': 'Failed to connect to your database with credentials'}), 400

            response = capture( jsonData['rds_endpoint'],
                                jsonData['region_name'],
                                jsonData['db_user'],
                                jsonData['db_password'],
                                jsonData['db_name'],
                                jsonData['start_time'],
                                jsonData['end_time'],
                                jsonData['alias'],
                                jsonData['bucket_name'],
                                g.user,
                                db.get_session())
            if (isinstance(response, int) and response > -1):
                return jsonify({'captureId': response}), 201
            else:
                return jsonify({'error': response['Error']['Message']}), response['Error']['Code']
        else:
            return jsonify({"error": "Generic Error."}), 400


    @app.route('/users/replays', methods=['GET'])
    @auth.login_required
    def get_users_replays():
        isFast = request.args.get('isFast')

        if (isinstance(isFast, str) and isFast.lower() == 'true'):
            isFast = 1
        elif (isinstance(isFast, str) and isFast.lower() == 'false'):
            isFast = 0
        else:
            isFast = None

        userReplays = getUsersReplays(g.user.get_id(), isFast, db.get_session())

        return jsonify({"count": len(userReplays), "userReplays": userReplays}), 200

    @app.route('/users/replays/<replay_id>', methods=['GET'])
    @auth.login_required
    def get_replay(replay_id):
        userReplays = getReplayFromId(replay_id, db.get_session())
        if (len(userReplays) == 0):
            return jsonify(), 404

        userReplay = userReplays[0]
        if (userReplay['userId'] != g.user.get_id()):
            return jsonify(), 403

        return jsonify(userReplay), 200

    @app.route('/users/replays', methods=['POST'])
    @auth.login_required
    def post_replay():
        if request.headers['Content-Type'] == 'application/json':
            jsonData = request.json

            if ('capture_id' not in jsonData or
                'replay_alias' not in jsonData or
                'rds_endpoint' not in jsonData or
                'region_name' not in jsonData or
                'db_user' not in jsonData or
                'db_password' not in jsonData or
                'db_name' not in jsonData or
                'bucket_name' not in jsonData or
                'start_time' not in jsonData or
                'is_fast' not in jsonData):
                    return jsonify({"error": "Missing field in request."}), 400

            if (len(getReplayFromAlias(jsonData['replay_alias'], db.get_session())) != 0 or
                len(getCaptureFromAlias(jsonData['replay_alias'], db.get_session())) != 0):
                return jsonify({"error": "Alias is unavailable."}), 400

            try:
                connection = pymysql.connect(jsonData['rds_endpoint'], user=jsonData['db_user'], passwd=jsonData['db_password'], db=jsonData['db_name'], connect_timeout=5)
                queries = []

                if connection.open:
                    connection.close()
            except OperationalError as e:
                return jsonify({'error': 'Failed to connect to your database with credentials'}), 400

            response = insertReplay(g.user.get_id(),
                                    jsonData['capture_id'],
                                    jsonData['replay_alias'],
                                    jsonData['bucket_name'],
                                    jsonData['rds_endpoint'],
                                    jsonData['db_user'],
                                    jsonData['db_password'],
                                    jsonData['db_name'],
                                    jsonData['region_name'],
                                    jsonData['start_time'].split('.', 1)[0].replace('T', ' '),
                                    jsonData['is_fast'],
                                    db.get_session())

            if (isinstance(response, int) and response is not -1):
                capture = getCaptureFromId(jsonData['capture_id'], db.get_session())[0]

                if (jsonData['is_fast']):
                    p = Process(target=replay, args=(response, jsonData['replay_alias'], jsonData['rds_endpoint'], jsonData['region_name'], jsonData['db_user'], jsonData['db_password'], jsonData['db_name'], jsonData['bucket_name'], capture, db.get_session(), g.user))
                    p.daemon = True
                    p.start()
                else:
                    newReplay = getReplayFromId(response, db.get_session())[0]
                    prepare_scheduled_replay(newReplay, capture, db.get_session())

                return jsonify({'replayId': response}), 201
            else:
                return jsonify({'error': response}), 400

        else:
            return jsonify({"error": "Generic Error."}), 400

    @app.route('/users/replays/<replayId>/replays', methods=['GET'])
    @auth.login_required
    def get_associated_replays_from_replay(replayId):
        user_captures = getCaptureFromReplayId(replayId, db.get_session())
        if (len(user_captures) == 0):
            return jsonify(), 404

        user_capture = user_captures[0]
        if (user_capture['userId'] != g.user.get_id()):
            return jsonify(), 403

        user_replays = getReplaysFromCapture(user_capture['captureId'], db.get_session())
        if (len(user_replays) == 0):
            return jsonify(), 404
        for replay in user_replays:
            if (replay['userId'] != g.user.get_id()):
                return jsonify(), 403

        return jsonify({'count': len(user_replays), 'capture': user_capture, 'userReplays': user_replays}), 200

    @app.route('/users/captures/<capture_id>/replays', methods=['GET'])
    @auth.login_required
    def get_associated_replays_from_capture(capture_id):
        user_replays = getReplaysFromCapture(capture_id, db.get_session())

        if (len(user_replays) == 0):
            return jsonify(), 404

        for replay in user_replays:
            if (replay['userId'] != g.user.get_id()):
                return jsonify(), 403

        return jsonify({'count': len(user_replays), 'userReplays': user_replays}), 200

    @app.route('/users/s3Buckets', methods=['GET'])
    @auth.login_required
    def get_s3_instances():
        response = getS3Instances(g.user)

        if (isinstance(response, list)):
            return jsonify({'count': len(response), 's3Instances': response}), 200

        return jsonify({'error': response['Error']['Code']}), response['ResponseMetadata']['HTTPStatusCode']

    @app.route('/users/rdsInstances/<region_name>', methods=['GET'])
    @auth.login_required
    def get_rds_instances(region_name):
        response = getRDSInstances(region_name, g.user)

        if (isinstance(response, list)):
            return jsonify({'count': len(response), 'rdsInstances': response}), 200

        return jsonify({'error': response['Error']['Code']}), response['ResponseMetadata']['HTTPStatusCode']

    @app.route('/users/captures/<capture_id>/metrics', methods=["GET"])
    @auth.login_required
    def get_capture_metrics(capture_id):
        user_captures = getCaptureFromId(capture_id, db.get_session())
        return api_get_metrics(user_captures)

    @app.route('/users/replays/<replay_id>/metrics', methods=["GET"])
    @auth.login_required
    def get_replay_metrics(replay_id):
        user_replays = getReplayFromId(replay_id, db.get_session())
        return api_get_metrics(user_replays)

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
        return jsonify({ "token" : token.decode('ascii') })

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

    def api_get_metrics(user_captures_replays):
        metrics = {}
        availableMetrics = ['FreeableMemory', 'CPUUtilization', 'ReadIOPS', 'WriteIOPS']

        if (len(user_captures_replays) == 0):
            return jsonify(), 404

        user_capture_replay = user_captures_replays[0]

        if ('captureAlias' in user_capture_replay.keys()):
            alias = user_capture_replay['captureAlias']
        elif ('replayAlias' in user_capture_replay.keys()):
            alias = user_capture_replay['replayAlias']
        else:
            return jsonify({'error': 'Invalid capture/replay'}), 500

        if (user_capture_replay['userId'] != g.user.get_id()):
            return jsonify(), 403

        for metric in availableMetrics:
            response = get_metrics(metric, alias + '.metrics', user_capture_replay['s3Bucket'], g.user)
            if (type(response) is not dict):
                metrics[metric] = response
            else:
                return jsonify({'error': response['Error']['Message']}), response['Error']['Code']

        os.remove(alias + ".metrics")

        return jsonify(metrics), 200

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.get_session().remove()

    return app
