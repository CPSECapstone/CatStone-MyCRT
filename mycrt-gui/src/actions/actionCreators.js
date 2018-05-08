import * as api from '../api';
//TODO: remove template function, replace with other actions

/*export function exampleAction(credentials, cb) {
    return (dispatch, prevState) => {
        
    };
}*/

export function logIn(username, password, cb, errCb) {
    return (dispatch, prevState) => {
        api.logIn(username, password)
          .then(result => console.log("User logged in successfully"))
          .then(() => {if (cb) cb();})
          .catch((error) => {
              if (errCb) errCb();
          })
    }
}

export function logOut(cb) {

    return (dispatch, prevState) => {
        api.logOut();

        if (cb) cb();
    }
}

export function register(userInfo, cb, errCb) {
    return (dispatch, prevState) => {
        api.register(userInfo)
          .then(result => console.log("User Created successfully"))
          .then(() => {if (cb) cb();})
          .catch((error) => {
              if (errCb) errCb("User already exists");
          })
    }
}
// logInUser() {
//     $.ajax({
//       url: SERVER_PATH + "/authenticate",
//       dataType: 'json',
//       headers: {'Content-Type': 'application/json',
//                 'Authorization': 'Basic ' + btoa(this.state.usernameValue + ":" + this.state.passwordValue)},
//       type: 'GET',
//       success: function(data) {
//         console.log("Successful Login");
//         console.log(data.token);
//         this.setState(prevState => ({
//           showLogInError: false
//         }));
//         this.props.onLogIn(data.token);
//       }.bind(this),
//       error: function(xhr, status, err) {
//         console.error(this.props.url, status, err.toString());
//         this.setState(prevState => ({
//           showLogInError: true
//         }));
//       }.bind(this)
//   });