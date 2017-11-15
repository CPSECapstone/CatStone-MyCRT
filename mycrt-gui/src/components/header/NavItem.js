import React, { Component } from 'react';

import './NavItem.css';
//import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css'

class NavItem extends Component {
  render() {
    return (
      <div class="nav-item">
      	<a href={this.props.href}>
      		{this.props.name}
      	</a>
      </div>
    );
  }
}

export default NavItem;