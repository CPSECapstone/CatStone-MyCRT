import React, { Component } from 'react';

import './NavPage.css';
import HomePage from './HomePage.js';
import ViewResults from './ViewResults.js';
import ComparePage from './ComparePage.js';

class NavPage extends Component {
  componentDidUpdate () {
    window.scrollTo(0, 0)
  }

  render() {
    var getState = function(idx) {
      switch (idx) {
      case 0:
        return (<HomePage/>);
      case 1:
        return (<ViewResults/>);
      default:
        return (<ComparePage/>);
      }
    }
    return (
      <div class="NavPage">
      	{getState(this.props.selected)}
      </div>
    );
  }
}

export default NavPage;