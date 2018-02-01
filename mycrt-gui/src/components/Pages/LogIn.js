import React, { Component } from 'react';
import $ from 'jquery';

import './LogIn.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

import Button from './Button.js';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameValue: undefined,
      passwordValue: undefined,
      isSubmitDisabled: true,
      isRegisterCalloutVisible: false,
      regUsernameValue: undefined,
      regPasswordValue: undefined,
      emailValue: undefined,
      awsKeyValue: undefined,
      secretKeyValue: undefined
      };

    this.sendLoginData = this.sendLoginData.bind(this);
    this.onLogIn = this.onLogIn.bind(this);

    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onRegisterClick = this.onRegisterClick.bind(this);
    this.isSubmitDisabled = this.isSubmitDisabled.bind(this);
    this.onRegisterDismiss = this.onRegisterDismiss.bind(this);

    this.onRegUsernameChange = this.onRegUsernameChange.bind(this);
    this.onRegPasswordChange = this.onRegPasswordChange.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onAWSKeyChange = this.onAWSKeyChange.bind(this);
    this.onSecretKeyChange = this.onSecretKeyChange.bind(this);
    this.isRegisterFieldsFilled = this.isRegisterFieldsFilled.bind(this);
  }

  sendLoginData(formDataValues) {
    //TODO: uncomment after server path /login is created
    /*
    console.log(formDataValues);
    $.ajax({
      url: SERVER_PATH + "/login",
      dataType: 'json',
      headers: {'Content-Type': 'application/json'},
      type: 'POST',
      data: JSON.stringify(formDataValues),
      success: function(data) {
        console.log("SUCCESS login form");
        console.log(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    */
  }

  onLogIn() {
    var userInfo = {
      username: this.state.usernameValue,
      password: this.state.passwordValue
    };
    this.sendLoginData(userInfo);
    this.props.onLogIn();
  }

  onUsernameChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        usernameValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        usernameValue: value
      }));
    }
  }

  onPasswordChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        passwordValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        passwordValue: value
      }));
    }
  }

  onRegisterClick() {
    this.setState(prevState => ({
      isRegisterCalloutVisible: true
    }));
  }

  onRegisterDismiss() {
    this.setState(prevState => ({
      isRegisterCalloutVisible: false
    }));
  }

  isSubmitDisabled() {
    return (this.state.passwordValue != undefined && this.state.usernameValue != undefined);
  }

  isRegisterFieldsFilled() {
    return this.state.regUsernameValue != undefined && this.state.regPasswordValue != undefined
    && this.state.emailValue != undefined && this.state.awsKeyValue != undefined
    && this.state.secretKeyValue != undefined;
  }

  onRegUsernameChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        regUsernameValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        regUsernameValue: value
      }));
    }
  }

  onRegPasswordChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        regPasswordValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        regPasswordValue: value
      }));
    }
  }

  onEmailChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        emailValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        emailValue: value
      }));
    }
  }

  onAWSKeyChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        awsKeyValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        awsKeyValue: value
      }));
    }
  }

  onSecretKeyChange(event, value) {
    if (value.length == 0) {
      this.setState(prevState => ({
        secretKeyValue: undefined
      }));
    } else {
      this.setState(prevState => ({
        secretKeyValue: value
      }));
    }
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.onRegisterDismiss}
      />,
      <FlatButton
        label="Register"
        primary={true}
        disabled={!this.isRegisterFieldsFilled()}
        onClick={this.onRegisterDismiss}
      />
    ];

    return (
      <div class="LogIn">
        <div class="log-in-content">
          <div class="log-in-item">
            <h3>My Capture Replay Tool</h3>
          </div>
          <div class="log-in-item">
            <h5>Username</h5>
             <TextField
                hintText="Type username here"
                onChange={this.onUsernameChange}
              />
          </div>
          <div class="log-in-item">
            <h5>Password</h5>
             <TextField
                hintText="Type password here"
                onChange={this.onPasswordChange}
                type="password"
              />
          </div>
          <div class="log-in-item">
            <Button 
              onClick={this.onLogIn}
              content="Log In"
              isDisabled={!this.isSubmitDisabled()}
            />
          </div>
          <div class="log-in-item">
            <div class="log-in-register-link" onClick={this.onRegisterClick}>
              <h5>Don't have an account? Click here to register.</h5>
            </div>
          </div>
        </div>
        <Dialog
          title="Register Account"
          actions={actions}
          modal={true}
          open={this.state.isRegisterCalloutVisible}
          autoScrollBodyContent={true}
        >
          <div class="register-content">
            <div class="register-item">
              Username
               <TextField
                  hintText="Type username here"
                  onChange={this.onRegUsernameChange}
                />
            </div>
            <div class="register-item">
              Password
               <TextField
                  hintText="Type password here"
                  onChange={this.onRegPasswordChange}
                  type="password"
                />
            </div>
            <div class="register-item">
              Email
               <TextField
                  hintText="Type email here"
                  onChange={this.onEmailChange}
                />
            </div>
            <div class="register-item">
              AWS Key
               <TextField
                  hintText="Type aws key here"
                  onChange={this.onAWSKeyChange}
                />
            </div>
            <div class="register-item">
              Secret Key
               <TextField
                  hintText="Type secret key here"
                  onChange={this.onSecretKeyChange}
                />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default LogIn;
