from pymysql import OperationalError, MySQLError, connect
from rpyc.utils.server import ThreadedServer
from src.metrics.metrics import save_metrics
from src.database.getRecords import getReplayStatus
from src.database.updateRecords import updateReplay
from src.server import run_query
import rpyc
import os
import sys
import time
from datetime import datetime, timedelta
from pytz import utc, timezone

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

def the_job(oid):
    print('Run job: object.id={}, datetime={}'.format(oid, datetime.now()))


def print_text(text):
    print(text)


class SchedulerService(rpyc.Service):

    def exposed_add_scheduled_replay(self, replay, query, scheduled_time, db_session, user):
        print('fuuuuck')
        trigger = DateTrigger(run_date=scheduled_time)
        print('after trigger')
        print(replay['replayId'])
        replay_id = str(replay['replayId'])
        print(replay_id)
        scheduler.add_job(func=run_query, args=[replay, query],
                          trigger=trigger,
                          coalesce=True,
                          name=replay_id,
                          max_instances=1,
                          jobstore='default',
                          executor='default')
        print('added job lmao')

    def exposed_add_job_merp(self, oid):
        trigger = DateTrigger(run_date=datetime.now() + timedelta(seconds=oid))
        print('adding job!')
        scheduler.add_job(func=the_job, args=[oid],
                          trigger=trigger,
                          id='task-{}'.format(oid),
                          name='Task({})'.format(oid),
                          coalesce=True,
                          max_instances=1,
                          jobstore='default',
                          executor='default')

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
