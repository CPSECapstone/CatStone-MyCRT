import React, { Component } from 'react';

import './NavPage.css';
import HomePage from './HomePage.js';

class NavPage extends Component {
  render() {
    return (
      <div class="NavPage">
      	<HomePage/>
      </div>
    );
  }
}

export default NavPage;