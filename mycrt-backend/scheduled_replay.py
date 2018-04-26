from pymysql import OperationalError, MySQLError
import pymysql
from rpyc.utils.server import ThreadedServer
from src.metrics.metrics import save_metrics
from src.database.getRecords import getReplayStatus
from src.database.updateRecords import updateReplay
from flask import Flask, request, g, Response
from src.database.mycrt_database import MyCrtDb

import rpyc
from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.triggers.date import DateTrigger

rpyc.core.protocol.DEFAULT_CONFIG['allow_pickle'] = True

jobstores = {
    'default': SQLAlchemyJobStore(url='mysql+pymysql://root@localhost/cat_sched_replay'),
}
executors = {
    'default': ThreadPoolExecutor(20),
}
job_defaults = {
    'coalesce': False,
    'max_instances': 1
}
scheduler = BackgroundScheduler(
    jobstores=jobstores, executors=executors,
    job_defaults=job_defaults
)

def run_query(replay, query, user):
    app = Flask(__name__, static_url_path='')
    app.config.from_object('config')

    db = MyCrtDb(app.config['SQLALCHEMY_DATABASE_URI'])

    ########
    replay_status = getReplayStatus(replay['replayId'], db.get_session())
    if replay_status == 0:
        print('starting replay')
        updateReplay(replay['replayId'], 1, db.get_session())

    inner_conn = None
    try:
        inner_conn = pymysql.connect(host=replay['rdsInstance'], user=replay['rdsUsername'],
                                     passwd=replay['rdsPassword'], db=replay['rdsDatabase'], connect_timeout=5)

        with inner_conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query)
            cursor.close()
        inner_conn.commit()

    except MySQLError as e:
        print(e)
    finally:
        if inner_conn is not None and inner_conn.open:
            inner_conn.close()


    pending_jobs = scheduler.get_jobs()
    replay_completed = True

    for job in pending_jobs:
        if job.name == str(replay['replayId']):
            replay_completed = False
            break

    if replay_completed:
        end_time = datetime.utcnow()
        save_replay_metrics(replay, end_time, user)
        updateReplay(replay['replayId'], 2, db.get_session())

def save_replay_metrics(replay, end_time, user):
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "CPUUtilization", replay['regionName'], user)
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "FreeableMemory", replay['regionName'], user)
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "ReadIOPS", replay['regionName'], user)
    save_metrics(replay['replayAlias'], replay['startTime'], end_time, replay['s3Bucket'], replay['rdsInstance'], "WriteIOPS", replay['regionName'], user)

def the_job(oid):
    print('Run job: object.id={}, datetime={}'.format(oid, datetime.now()))

class SchedulerService(rpyc.Service):

    def exposed_add_scheduled_replay(self, replay, query, scheduled_time, db_session, user):
        trigger = DateTrigger(run_date=scheduled_time)
        replay_id = str(replay['replayId'])
        scheduler.add_job(func=run_query, args=[replay, query, user],
                          trigger=trigger,
                          coalesce=True,
                          name=replay_id,
                          max_instances=1,
                          jobstore='default',
                          executor='default')
        print('added job lmao')

    def exposed_add_job(self, func, *args, **kwargs):
        return scheduler.add_job(func, *args, **kwargs)

    def exposed_modify_job(self, job_id, jobstore=None, **changes):
        return scheduler.modify_job(job_id, jobstore, **changes)

    def exposed_reschedule_job(self, job_id, jobstore=None, trigger=None, **trigger_args):
        return scheduler.reschedule_job(job_id, jobstore, trigger, **trigger_args)

    def exposed_pause_job(self, job_id, jobstore=None):
        return scheduler.pause_job(job_id, jobstore)

    def exposed_resume_job(self, job_id, jobstore=None):
        return scheduler.resume_job(job_id, jobstore)

    def exposed_remove_job(self, job_id, jobstore=None):
        scheduler.remove_job(job_id, jobstore)

    def exposed_get_job(self, job_id):
        return scheduler.get_job(job_id)

    def exposed_get_jobs(self, jobstore=None):
        return scheduler.get_jobs(jobstore)

    def exposed_get_replay_completed(self, replay_id):
        pending_jobs = scheduler.get_jobs()
        for job in pending_jobs:
            if job.id is replay_id:
                return False
        return True


    def exposed_print_all_jobs(self):
        print(scheduler.print_jobs())


def main():
    scheduler.start()

    protocol_config = {'allow_public_attrs': True}
    server = ThreadedServer(SchedulerService, port=12345, protocol_config=protocol_config)
    try:
        server.start()
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        scheduler.shutdown()


if __name__ == '__main__':
    main() 
