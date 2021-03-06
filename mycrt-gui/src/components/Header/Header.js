import React, { Component } from 'react';
import $ from 'jquery';

import './Header.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

import Popover from 'material-ui/Popover/Popover';
import {Menu, MenuItem} from 'material-ui/Menu';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';

import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class Header extends Component {
	constructor(props) {
    super(props);
    this.state = {
      isPopoverVisible: false,
      anchorEl: undefined,
      settingsVisible: false,
      helpVisible: false,
      notifsVisible: false,
      anchorOrigin: {
        horizontal: 'left',
        vertical: 'bottom',
      },
      targetOrigin: {
        horizontal: 'left',
        vertical: 'top',
      },
      changeKeysVisible: false,
      passwordValue: undefined,
      usernameValue: undefined,
      secretKeyValue: undefined,
      awsKeyValue: undefined,
      showError: false,
      errorMessage: ""
    };

    // This binding is necessary to make `this` work in the callback
    this.handleNotifsClick = this.handleNotifsClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);

    this.onChangeKeysOpen = this.onChangeKeysOpen.bind(this);
    this.onChangeKeysClose = this.onChangeKeysClose.bind(this);
    this.onChangeKeysSubmit = this.onChangeKeysSubmit.bind(this);
    this.isChangeKeysFieldsFilled = this.isChangeKeysFieldsFilled.bind(this);
    this.renderChangeKeysForm = this.renderChangeKeysForm.bind(this);

    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onAWSKeyChange = this.onAWSKeyChange.bind(this);
    this.onSecretKeyChange = this.onSecretKeyChange.bind(this);
  }

  onChangeKeysOpen() {
    this.setState({
      changeKeysVisible: true,
      settingsVisible: false
    });
  }

  onChangeKeysClose() {
    this.setState({
      changeKeysVisible: false,
      showError: false
    });
  }

  onChangeKeysSubmit() {
    var changeKeysInfo = {
      username: this.state.usernameValue,
      password: this.state.passwordValue,
      access_key: this.state.awsKeyValue,
      secret_key: this.state.secretKeyValue
    };

    this.props.putKeys(changeKeysInfo,
      this.onChangeKeysClose,
      (err) => {
        this.setState(prevState => ({showError: true, errorMessage: err}))
      }
    );
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

  isChangeKeysFieldsFilled() {
    return (this.state.passwordValue !== undefined && this.state.usernameValue !== undefined
      && this.state.secretKeyValue !== undefined && this.state.awsKeyValue !== undefined);
  }

  handleSettingsClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      settingsVisible: true,
      anchorEl: event.currentTarget,
    });
  };

  handleHelpClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      helpVisible: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      settingsVisible: false,
      helpVisible: false,
      notifsVisible: false
    });
  };

  handleNotifsClick = (event) => {
    this.setState({
      notifsVisible: true,
      anchorEl: event.currentTarget
    });
  }

  setAnchor = (positionElement, position) => {
    const {anchorOrigin} = this.state;
    anchorOrigin[positionElement] = position;

    this.setState({
      anchorOrigin: anchorOrigin,
    });
  };

  setTarget = (positionElement, position) => {
    const {targetOrigin} = this.state;
    targetOrigin[positionElement] = position;

    this.setState({
      targetOrigin: targetOrigin,
    });
  };

  renderChangeKeysForm() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.onChangeKeysClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={!this.isChangeKeysFieldsFilled()}
        onClick={this.onChangeKeysSubmit}
      />
    ];

    const dropdownStyle = {
      customWidth: {
        width: 300,
      },
    };

    return (
      <Dialog title="Change AWS Keys"
        actions={actions}
        modal={true}
        open={this.state.changeKeysVisible}
        autoScrollBodyContent={true}>
        {this.state.showError &&
          <div class="error-message">
            {this.state.errorMessage}
          </div>}
        <div class="aws-keys-item">
          Verify Account Username
             <TextField
            hintText="Type username here"
            onChange={this.onUsernameChange}
          />
        </div>
        <div class="aws-keys-item">
          Verify Account Password
             <TextField
            hintText="Type password here"
            onChange={this.onPasswordChange}
            type="password"
          />
        </div>
        <div class="aws-keys-item">
          New AWS Key
           <TextField
              hintText="Type aws key here"
              onChange={this.onAWSKeyChange}
              type="password"
            />
        </div>
        <div class="aws-keys-item">
          New Secret Key
           <TextField
              hintText="Type secret key here"
              onChange={this.onSecretKeyChange}
              type="password"
            />
        </div>
      </Dialog>
    );
  }

  render() {
    return (
      <div class="Header">
      	<div class="header-title">
      		<h5>My Capture Replay Tool</h5>
      	</div>
      	<div class="header-glyphicons">
          <div class="logout glyphiconstyle" onClick={this.props.onLogOut}>
            Logout
            <div class="glyphicon glyphicon-log-out" />
          </div>
          <div class="glyphiconstyle glyphicon glyphicon-question-sign" 
            onClick={this.handleHelpClick}></div>
          <div class="glyphiconstyle glyphicon glyphicon-cog" 
              onClick={this.handleSettingsClick}></div>
          <div class="glyphiconstyle glyphicon glyphicon-bell badge1" 
            data-badge="2"
            onClick={this.handleNotifsClick}></div>
        </div>
        <Popover
          open={this.state.notifsVisible}
          anchorEl={this.state.anchorEl}
          anchorOrigin={this.state.anchorOrigin}
          targetOrigin={this.state.targetOrigin}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText="Notifications (2 new)" disabled={true} />
            <div class="alpha-note">ALPHA RELEASE NOTE: This feature is not ready yet. Placeholder notifications below.</div>
            <div class="notif-menu-card">
            <MenuItem> 
              <div class="notif-menu-card-content">Capture 23 completed. Click to view capture results.</div>
            </MenuItem>
            </div>
            <div class="notif-menu-card">
            <MenuItem> 
              <div class="notif-menu-card-content">Capture 25 terminated with errors. Click to view capture errors.</div>
            </MenuItem>
            </div>
          </Menu>
        </Popover>
        <Popover
          open={this.state.settingsVisible}
          anchorEl={this.state.anchorEl}
          anchorOrigin={this.state.anchorOrigin}
          targetOrigin={this.state.targetOrigin}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText="Change AWS Keys" onClick={this.onChangeKeysOpen}/>
          </Menu>
        </Popover>
        <Popover
          open={this.state.helpVisible}
          anchorEl={this.state.anchorEl}
          anchorOrigin={this.state.anchorOrigin}
          targetOrigin={this.state.targetOrigin}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText="About" onClick={() => {window.open("https://noizrnel3.wixsite.com/catstone")}}/>
            <MenuItem primaryText="Contact Us" onClick={() => {window.open("https://noizrnel3.wixsite.com/catstone/external-contact-page")}}/>
          </Menu>
        </Popover>
        {this.renderChangeKeysForm()}
      </div>
    );
  }
}

export default Header;
