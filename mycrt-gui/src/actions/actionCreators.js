import * as api from '../api';

export function setToken(token) {
    return (dispatch, prevState) => {
        api.setToken(token)
          .catch((error) => {
              dispatch({type:"LOG_OUT"})
          })
    }
}
export function logIn(username, password, cb, errCb) {
    return (dispatch, prevState) => {
        api.logIn(username, password)
          .then(token => dispatch({token: token, type: "LOG_IN"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
              if (errCb) errCb();
          })
    }
}

export function logOut(cb) {

    return (dispatch, prevState) => {
        api.logOut();
        dispatch({type:"LOG_OUT"});
        if (cb) cb();
    }
}

export function register(userInfo, cb, errCb) {
    return (dispatch, prevState) => {
        api.register(userInfo)
          .then(result => console.log("User Created successfully"))
          .then(() => {if (cb) cb();})
          .catch((error) => {
              checkError(error, dispatch);
              if (errCb) errCb(error);
          })
    }
}

export function getAllCaptures(cb, errCb) {
    return (dispatch, prevState) => {
        api.getAllCaptures()
          .then(captures => dispatch({captures: captures, type: "GET_CAPTURES"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
            checkError(error, dispatch);
              if (errCb)
                 errCb();
              console.log('We had an error of ' + error);
          });
    }
}

export function getAllReplays(cb, errCb) {
    return (dispatch, prevState) => {
        api.getAllReplays()
          .then(replays => dispatch({replays: replays, type: "GET_ALL_REPLAYS"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
            checkError(error, dispatch);
              if (errCb)
                 errCb();
              console.log('We had an error of ' + error);
          });
    }
}

export function getS3Buckets(cb, errCb) {
    return (dispatch, prevState) => {
        api.getS3Buckets()
          .then(buckets => dispatch({buckets: buckets, type: "GET_USER_BUCKETS"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
            checkError(error, dispatch);
              if (errCb) errCb();
              console.log("Error retrieving S3 Buckets: " + error);
          })
    }
}

export function getRDSInstances(region, cb, errCb) {
    return (dispatch, prevState) => {
        api.getRDSInstances(region)
          .then(rdsInstances => dispatch({rdsInstances: rdsInstances, type: "GET_USER_INSTANCES"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
            checkError(error, dispatch);
              if (errCb) errCb();
              console.log("Error retrieving RDS Instances: " + error);
          })
    }
}

export function postCapture(capture, cb, errCb) {
    return (dispatch, prevState) => {
        api.postCapture(capture)
          .then(() => dispatch({capture: {
             captureAlias: capture.alias,
             captureStatus: 4, //LOADING
             rdsInstance: capture.rds_endpoint,
             s3Bucket: capture.bucket_name,
             endTime: capture.end_time,
             startTime: capture.start_time
          }, type:"ADD_CAPTURE"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
            error.then((result) => {if (errCb) errCb(result.error)})  
          })
    }
}

export function postReplay(replay, cb, errCb) {
    return (dispatch, prevState) => {
        api.postReplay(replay)
          .then(() => dispatch({replay: {
            replayAlias: replay.replay_alias,
            rdsInstance: replay.rds_endpoint,
            s3Bucket: replay.bucket_name,
            replayStatus: 4, //LOADING
            startTime: replay.start_time,
            is_fast: replay.is_fast
          }, type:"ADD_REPLAY"}))
          .then(() => {if (cb) cb();})
          .catch((error) => {
            error.then((result) => {if (errCb) errCb(result.error)})  
          })
    }
}

export function putEndTime(captureId, endTime, cb, errCb) {
	return (dispatch, prevState) => {
    api.putEndTime(captureId, endTime)
      .then(() => {if (cb) cb();})
      .catch((error) => {
        if (errCb) errCb("Error submitting endTime " + endTime + " for capture " + captureId)  
      })
  }
}

export function putKeys(changeKeysInfo, cb, errCb) {
  return (dispatch, prevState) => {
    api.putKeys(changeKeysInfo)
      .then(() => {if (cb) cb();})
      .catch((error) => {
        if (errCb) errCb(error)  
      })
  }
}

function checkError(err, dispatcher) {
    return err[0].includes("Unauthorized") ? dispatcher({type:"LOG_OUT"}) : console.log(err); 
}