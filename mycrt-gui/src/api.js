/* api.js
 *
 * File that contains all direct api calls to the baseURL.
 */
const baseURL = "http://localhost:5000/";
const headers = new Headers();
var cookie;

headers.set('Content-Type', 'application/json');

var reqConf = {
    headers: headers,
    credentials: 'include',
};

var smartFetch = (url, body) => fetch(url, body).catch(serverConnectError);
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

//export function logIn
/*
export function logOut
export function register
export function getCaptureData
export function getReplayData
export function getCaptureMetricData
export function getReplayMetricData
export function postCaptureData
export function postReplayData
export function getSuccessfulCaptures
export function getS3Data
export function getRdsData
*/

//TEMPLATE/OLD API FUNCTIONS PLEASE DELETE
/*
export function signIn(cred) {
    console.log("API signin with " + cred);

    return post("authenticate", cred)
     .then((response) => {
        if (response.ok) {
            return response.json();
        }

        return createErrorPromise(response);
     })
     .then(json => {
         console.log(json);
         cookie = "JWT " + json["access_token"];
         console.log(cookie);
         headers.set("Authorization", cookie);
         reqConf = {
             headers: headers,
             credentials: "include"
         }
         return {username: cred.username};
     })
}

export function signOut() {
    cookie = "access_token=undefined";
    
    return 200;
}

export function register(userInfo) {
    console.log("API register with " + userInfo);

    return post("register", userInfo)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
        return 200;
     });
}

export function getAllOrgs() {
    headers.set("Authorization", cookie);

    return get("orgs/all")
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
         return json["message"];
     })
}

export function getAllAdminOrgs() {
    headers.set("Authorization", cookie);

    return get("orgs/admin=true")
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
        return json["message"];
     });
}

export function getAllMemberOrgs() {
    headers.set("Authorization", cookie);

    return get("orgs/admin=false")
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
        return json["message"];
     });
}

export function postOrg(org) {
    headers.set("Authorization", cookie);

    return post("orgs/create", org)
     .then((response) => {
         if (response.ok) {
            return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
        return json;
     });
}

export function postOrgJoinStatus(response, orgId) {
    return post("orgs?join=" + response + "&org_id=" + orgId)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => json);
}

export function getAllFilteredEvents(filter) {
    headers.set("Authorization", cookie);

    console.log("Getting all filtered events");

    return get("events?filter=" + filter)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
         return json["message"];
     })
}

export function getAdminEvents() {
    headers.set("Authorization", cookie);

    return get("events/admin=true")
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
         return json["message"];
     })
}

export function postEvent(eventInfo) {
    headers.set("Authorization", cookie);

    return post("events/create", eventInfo)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
         return json["message"];
     })
}

export function postEventResponse(body) {
    headers.set("Authorization", cookie);

    return post("events/rsvp", body)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
        return json["message"];
     });
}

export function updateEventResponse(body) {
    headers.set("Authorization", cookie);

    return put("events/rsvp", body)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
        return json["message"];
     });
}

export function serverConnectError() {
    return Promise.reject(["Server Connect Error"]);
}

function createErrorPromise(response, body) {
    console.log("CREATING ERROR PROMISE **********");
    console.log(response.status);
    console.log(response);
    if (response.status === 400)
       return Promise.resolve(response)
       .then(response => response.json())
       .then(errorList => Promise.reject(errorList.length ? 
        ["had an error"] : ["Unknown error"]));
    else if (response.status === 500)
       return Promise.reject(["Server Connect Error"]);
    else
       return Promise.reject(["Unknown error"]);
 }

 export function getAllRSVPEvents(sel) {
    headers.set("Authorization", cookie);

    return get("events/rsvp=" + sel)
     .then((response) => {
         if (response.ok) {
             return response.json();
         }

         return createErrorPromise(response);
     })
     .then(json => {
         return json["message"];
     })
}