import React, { Component } from 'react';
import $ from 'jquery';

import './Header.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

import Popover from 'material-ui/Popover/Popover';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';

class Header extends Component {
	constructor(props) {
    super(props);
    this.state = {
      isPopoverVisible: false,
      anchorEl: undefined,
      anchorOrigin: {
        horizontal: 'left',
        vertical: 'bottom'
      },
      targetOrigin: {
        horizontal: 'left',
        vertical: 'top'
      }
    };

    // This binding is necessary to make `this` work in the callback
    this.showPopover = this.showPopover.bind(this);

    this.handleNotifClick = this.handleNotifClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  showPopover() {
    this.setState(prevState => ({
      isPopoverVisible: true
    }));
  };

  handleNotifClick(event) {
    // This prevents ghost click.
    event.preventDefault();
    this.setState(prevState => ({
      isPopoverVisible: true,
      anchorEl: event.currentTarget
    }));
    console.log(event.currentTarget)
  };

  handleRequestClose() {
    this.setState(prevState => ({
      isPopoverVisible: false
    }));
  };

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
          <IconMenu
            iconButtonElement={
              <IconButton touch={true}>
                <div class="glyphiconstyle glyphicon glyphicon-question-sign" />
              </IconButton>
            }
          >
            <MenuItem>
            <a href="https://noizrnel3.wixsite.com/catstone/external-contact-page" target="_blank"><div>Contact Us</div></a>
            </MenuItem>
          </IconMenu>
	        <div class="glyphiconstyle glyphicon glyphicon-cog" />
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
      </div>
    );
  }
}

export default Header;
