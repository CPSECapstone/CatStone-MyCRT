import React, { Component } from 'react';
import NavItem from './NavItem';

import './NavBar.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

var navLinks = [
  {
    name: "Home",
    href: "#"
  },
  {
    name: "View Results",
    href: "#"
  },
  {
    name: "Compare",
    href: "#"
  }]

class NavBar extends Component {
  render() {
    var createLinkItem = function(item, index) {
      return <NavItem key={item.name + index} href={item.href} name={item.name} />;
    };

    return (
      <div class="Nav-Bar">
        <nav class="col-sm-3 col-md-1 d-sm-block bg-light sidebar">
          <ul class="nav nav-pills flex-column">
          {navLinks.map(createLinkItem)}
          </ul>
        </nav>
      </div>
    );
  }
}

export default NavBar;