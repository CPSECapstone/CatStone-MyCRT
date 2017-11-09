import React, { Component } from 'react';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css'

class NavItem extends Component {
  render() {
    return (
      <li class="nav-item"><a href={this.props.href}>{this.props.name}</a></li>
    );
  }
}

export default NavItem;