import React, { Component } from 'react';
import './Callout.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from './Button.js';

class Callout extends Component {
	constructor(props) {
    super(props);
    this.state = {isVisible: this.props.isVisible};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      isVisible: !prevState.isVisible
    }));
  }

  render() {
    return ( 
    <div>
      {this.state.isVisible &&
      	<div class="Callout">
      		<form class="callout-form">
            <h2>Add Capture</h2>
            <div class="form-element">
            <h4>Endpoint to capture:</h4>
            <input class="form-input" type="text" name="endpoint" value="default value here" />
            </div>

            <div class="form-element">
            <h4>Capture alias:</h4>
            <input class="form-input" type="text" name="endpoint" value="Capture_1" />
            </div>

            <div class="form-element">
            <h4>End time:</h4>
            <input class="form-input" type="text" name="endpoint" value="default value here" />
            </div>
          </form> 
          <div class="submit-button">
        		<Button 
              onClick={this.props.onDismiss}
              content="Submit"
            />
          </div>
      	</div>
      }
    </div>
    );
  }
}

export default Callout;