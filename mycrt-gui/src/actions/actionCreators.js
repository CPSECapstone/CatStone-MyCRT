//TODO: remove api and signIn function, replace with other actions
//import * as api from '../api';

/*export function signIn(credentials, cb) {
    console.log("Sign In Action Creator");

    return (dispatch, prevState) => {
        api.signIn(credentials)
         .then((userInfo) => dispatch({user: userInfo, type: "SIGN_IN"}))
         .then(() => {if (cb) cb();})
         .catch((error) => {
             console.log('We had an error of ' + error);
         });
    };
}*/