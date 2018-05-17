import React, { Component } from 'react';
import $ from 'jquery';

import './Header.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

import Popover from 'material-ui/Popover/Popover';
import {Menu, MenuItem} from 'material-ui/Menu';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';

class Header extends Component {
	constructor(props) {
    super(props);
    this.state = {
      isPopoverVisible: false,
      anchorEl: undefined,
      settingsVisible: false,
      helpVisible: false,
      anchorOrigin: {
        horizontal: 'left',
        vertical: 'bottom',
      },
      targetOrigin: {
        horizontal: 'left',
        vertical: 'top',
      },
    };

    // This binding is necessary to make `this` work in the callback
    this.handleNotifClick = this.handleNotifClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
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
      helpVisible: false
    });
  };

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

  handleNotifClick(event) {
    // This prevents ghost click.
    event.preventDefault();
    this.setState(prevState => ({
      isPopoverVisible: true,
      anchorEl: event.currentTarget
    }));
    console.log(event.currentTarget)
  }

  handleRequestClose() {
    this.setState(prevState => ({
      isPopoverVisible: false
    }));
  }

  render() {
    return (
      <div class="Header">
      	<div class="header-title">
      		<h5>My Capture Replay Tool</h5>
      	</div>
      	<div class="header-glyphicons">
          <div class="logout glyphiconstyle" onClick={this.props.logOut}>
            Logout
            <div class="glyphicon glyphicon-log-out" />
          </div>
          <div class="glyphiconstyle glyphicon glyphicon-question-sign" 
            onClick={this.handleHelpClick}></div>
          <div class="glyphiconstyle glyphicon glyphicon-cog" 
              onClick={this.handleSettingsClick}></div>
	        <IconMenu
            iconButtonElement={
              <IconButton touch={true}>
                <div class="glyphiconstyle glyphicon glyphicon-bell badge1" data-badge="2" />
              </IconButton>
            }
          >
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
          </IconMenu>
        </div>
        <Popover
          open={this.state.settingsVisible}
          anchorEl={this.state.anchorEl}
          anchorOrigin={this.state.anchorOrigin}
          targetOrigin={this.state.targetOrigin}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText="Refresh" />
            <MenuItem primaryText="Help &amp; feedback" />
            <MenuItem primaryText="Settings" />
            <MenuItem primaryText="Sign out" />
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
            <MenuItem primaryText="Contact Us" onClick={() => {window.open("https://noizrnel3.wixsite.com/catstone/external-contact-page")}}/>
          </Menu>
        </Popover>
      </div>
    );
  }
}

export default Header;
