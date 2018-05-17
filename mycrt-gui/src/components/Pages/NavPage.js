import React, { Component } from 'react';

import './NavPage.css';
import HomePage from './HomePage.js';
import ViewResults from './ViewResults.js';

class NavPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var parentContext = this.props.parentContext;
    var that = this;

    var getState = function(idx) {
      switch (idx) {
      case 0:
        return (<HomePage parentContext={parentContext} {...that.props}/>);
      case 1:
        return (<ViewResults parentContext={parentContext} {...that.props}/>);
      default:
        return (<HomePage parentContext={parentContext} {...that.props}/>);
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