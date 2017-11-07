import React, { Component } from 'react';

import './Header.css';
import NavBar from './NavBar.js';

class Header extends Component {
  render() {
    return (
      <div className="Header">
        header here, title
        <NavBar />
      </div>
    );
  }
}

export default Header;