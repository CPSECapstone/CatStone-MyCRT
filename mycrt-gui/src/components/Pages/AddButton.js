import React, { Component } from 'react';
import './AddButton.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

class AddButton extends Component {
	constructor(props) {
    super(props);
    this.state = {showCallout: false};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      showCallout: !prevState.showCallout
    }));
  }

  render() {
    return ( 
    <div>
      <div class="AddButton" onClick={this.handleClick}>
        add button here
      </div>
      {this.state.showCallout &&
      	<div class="Callout">
      		HALLO
      		<button onClick={this.handleClick}>close</button>
      	</div>
      }
    </div>
    );
  }
}

export default AddButton;