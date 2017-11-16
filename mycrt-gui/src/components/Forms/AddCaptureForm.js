import React, { Component } from 'react';

import './CaptureReplayForm.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from '../Pages/Button.js';

class AddCaptureForm extends Component {
	constructor(props) {
    super(props);
    this.state = {isVisible: this.props.isVisible};

    // This binding is necessary to make `this` work in the callback
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSubmit() {
    this.props.onDismiss();
    console.log("submitted form");
  }

  onCancel() {
    this.props.onDismiss();
  }

  //TODO: move form to another component
  render() {
    return ( 
      <div class="AddCaptureForm">
      		<form class="capture-form">
            <h2>Add Capture</h2>
            <div class="form-element">
            <h4>Endpoint to capture:</h4>
            <input class="form-input" type="text" name="endpoint" defaultValue="default value here" />
            </div>

            <div class="form-element">
            <h4>Capture alias:</h4>
            <input class="form-input" type="text" name="endpoint" defaultValue="Capture_1" />
            </div>

            <div class="form-element">
            <h4>End time:</h4>
            <input class="form-input" type="text" name="endpoint" defaultValue="default value here" />
            </div>
          </form> 
          <div class="buttons">
            <div class="cancel-button">
            <Button 
              onClick={this.onCancel}
              content="Cancel"
            />
            </div>
            <div class="submit-button">
        		<Button 
              onClick={this.onSubmit}
              content="Submit"
            />
            </div>
          </div>
      	</div>
    );
  }
}

export default AddCaptureForm;