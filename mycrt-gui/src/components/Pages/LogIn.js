import React, { Component } from 'react';
import $ from 'jquery';

import './LogIn.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

import Button from './Button.js';
import TextField from 'material-ui/TextField';

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameValue: undefined,
      passwordValue: undefined,
      isSubmitDisabled: true
      };

    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.isSubmitDisabled = this.isSubmitDisabled.bind(this);
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

  isSubmitDisabled() {
    return (this.state.passwordValue != undefined && this.state.usernameValue != undefined)
  }

  render() {
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
                hintText="Type username here"
                onChange={this.onPasswordChange}
                type="password"
              />
          </div>
          <div class="log-in-item">
            <Button 
              onClick={this.props.onLogIn}
              content="Log In"
              isDisabled={!this.isSubmitDisabled()}
            />
          </div>
          <div class="log-in-item">
            <div class="log-in-register-link">
              <h5>Don't have an account? Click here to register.</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LogIn;
