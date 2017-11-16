import React, { Component } from 'react';

import './Header.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';


class Header extends Component {
  render() {
    return (
      <div className="Header">
      	<div class="header-title">
      		<h4>My Capture Replay Tool</h4>
      	</div>
      	<div class="header-glyphicons">
	        <div class="glyphicon glyphicon-question-sign" />
	        <div class="glyphicon glyphicon-cog" />
	        <div class="glyphicon glyphicon-envelope" />
        </div>
      </div>
    );
  }
}

export default Header;