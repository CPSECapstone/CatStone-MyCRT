import React, { Component } from 'react';

import './Header.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import { Popover } from 'react-bootstrap';
import { OverlayTrigger } from 'react-bootstrap';

const notificationPopover = (
  <Popover
  	className = "notification-popover"
	placement = "bottom"
	title = "Notifications (0)" >
	no notifications.
	</Popover>
);

class Header extends Component {
	constructor(props) {
    super(props);
    this.state = {isPopoverVisible: false};

    // This binding is necessary to make `this` work in the callback
    this.showPopover = this.showPopover.bind(this);
  }

  showPopover() {
    this.setState(prevState => ({
      isPopoverVisible: true
    }));
  }

  render() {
    return (
      <div className="Header">
      	<div class="header-title">
      		<h4>My Capture Replay Tool</h4>
      	</div>
      	<div class="header-glyphicons">
	        <div class="glyphicon glyphicon-question-sign" />
	        <div class="glyphicon glyphicon-cog" />
	        <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={notificationPopover}>
	        	<div class="glyphicon glyphicon-envelope" 
	        		onClick={this.showPopover} />
	        </OverlayTrigger>
        </div>
      </div>
    );
  }
}

export default Header;