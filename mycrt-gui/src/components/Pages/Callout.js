import React, { Component } from 'react';
import './Callout.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from './Button.js';

class Callout extends Component {
	constructor(props) {
    super(props);
    this.state = {isVisible: this.props.isVisible};
  }

  render() {
    return ( 
    <div class="Callout">
      {this.state.isVisible &&
      		this.props.content
      }
    </div>
    );
  }
}

export default Callout;