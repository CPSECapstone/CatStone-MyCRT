/* api.js
 *
 * File that contains all direct api calls to the baseURL.
 */
const baseURL = "http://localhost:5000/";
const headers = new Headers();
var token;

headers.set('Content-Type', 'application/json');

var reqConf = {
    headers: headers,
    credentials: 'include',
};

var smartFetch = (url, body) => fetch(url, body).catch(serverConnectError);

export function serverConnectError() {
    return Promise.reject(["Server Connect Error"]);
}

function createErrorPromise(response, body) {
    console.log("CREATING ERROR PROMISE **********");
    console.log(response.status);
    console.log(response);
    if (response.status === 400 || response.status === 404) {
       return Promise.resolve(response)
         .then(response => response.json())
         .then(errMsg => Promise.reject(errMsg["error"]))
    }
    else if (response.status === 500)
       return Promise.reject(["Server Connect Error"]);
    else if (response.status === 401)
       return Promise.resolve(response)
         .then(response => response.json())
         .then(errMsg => Promise.reject(errMsg["error"].includes("username") ? 
            errMsg["error"] :
            "Unauthorized Error"));
    else
       return Promise.reject(["Unknown error"]);
}
// Helper functions for the common request types

/**
 * make a post request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
export function post(endpoint, body) {
    return smartFetch(baseURL + endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...reqConf
    })
}

/**
 * make a put request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
export function put(endpoint, body) {
    return smartFetch(baseURL + endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...reqConf
    })
}

/**
 * make a get request
 * @param {string} endpoint
 * @returns {Promise}
 */
export function get(endpoint) {
    return smartFetch(baseURL + endpoint, {
        method: 'GET',
        ...reqConf
    })
}

/**
 * make a delete request
 * @param {string} endpoint
 * @returns {Promise}
 */
export function del(endpoint) {
    return smartFetch(baseURL + endpoint, {
        method: 'DELETE',
        ...reqConf
    })
}

export function setToken(tok) {
    token = tok;

    headers.set('Authorization', 'Basic ' + btoa(token + ":"));
    return get("authenticate")
      .then((response) => {
        if (response.ok) {
            return response.json();
        }

        console.log("Failed to login");
        return createErrorPromise(response)
    });
}

/**
 *
 * @param {string} username
 * @param {string} password
 */
export function logIn(username, password) {
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));

    return get("authenticate")
      .then((response) => {
        if (response.ok) {
            return response.json();
        }

        console.log("Ran into error here");
        return createErrorPromise(response);
      })
      .then(json => {
        token = json.token;
        return token;
      })
}

export function logOut() {
    headers.set('Authorization', '');
    token = undefined;
}

export function register(userInfo) {
    return post("users", userInfo)
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => {
          json;
      })
}

export function getAllCaptures() {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return get("users/captures")
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json["userCaptures"])
}

export function getAllReplays() {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return get("users/replays")
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json["userReplays"])
}

export function getS3Buckets() {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return get("users/s3Buckets")
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json["s3Instances"])
}

export function getRDSInstances(region) {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return get("users/rdsInstances/" + region)
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json["rdsInstances"])
}

export function postCapture(capture) {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return post("users/captures", capture)
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json)
}

export function postReplay(replay) {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return post("users/replays", replay)
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json)
}
  
export function putEndTime(captureId, endTime) {
  headers.set('Authorization', 'Basic ' + btoa(token + ":"));

  return put("users/captures/" + captureId, {end_time: endTime})
   .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json)
}

export function deleteCapture(captureId) {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return del("users/captures/" + captureId)
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json)
}

export function deleteReplay(replayId) {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return del("users/replays/" + replayId)
      .then((response) => {
          if (response.ok) {
              return response.json();
          }

          return createErrorPromise(response);
      })
      .then(json => json)
}
  
export function putKeys(changeKeysInfo) {
    headers.set('Authorization', 'Basic ' + btoa(token + ":"));

    return put("users/" + changeKeysInfo.username + "/keys", changeKeysInfo)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            return createErrorPromise(response);
        })
        .then(json => json)
}
