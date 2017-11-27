import React, { Component } from 'react';

import './CaptureReplayForm.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from '../Pages/Button.js';

class AddReplayForm extends Component {
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
      <div class="AddReplayForm">
      		<form class="replay-form">
            <h2>Add Replay</h2>
            <div class="form-element">
            <h4>Endpoint to replay:</h4>
            <input class="form-input" type="text" name="endpoint" defaultValue="default value here" />
            </div>

            <div class="form-element">
            <h4>Replay alias:</h4>
            <input class="form-input" type="text" name="endpoint" defaultValue="Replay_1" />
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
              isSubmit={false}
            />
            </div>
          </div>
      	</div>
    );
  }
}

export default AddReplayForm;