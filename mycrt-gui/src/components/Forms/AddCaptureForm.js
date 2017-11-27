import React, { Component } from 'react';

import './CaptureReplayForm.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from '../Pages/Button.js';
import $ from 'jquery';

class AddCaptureForm extends Component {
	constructor(props) {
    super(props);
    this.state = {
      formData: {
        region: "",
        rdsInstance: "",
        logFile: "",
        localLogFile: "",
        bucketName: ""
      }
    };

    // This binding is necessary to make `this` work in the callback
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.sendData = this.sendData.bind(this);
  }

  sendData(formDataValues) {
    console.log(formDataValues);
    $.ajax({
      url: 'http://localhost:5000/capture',
      dataType: 'json',
      headers: {'Content-Type': 'application/json'},
      type: 'POST',
      data: JSON.stringify(formDataValues),
      success: function(data) {
        console.log("successful form");
        console.log(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  onSubmit(e) {
    var formDataValues = {
       region: 'CHANGE-THIS',
       rdsInstance: 'CHANGE-THIS',
       logFile: 'CHANGE-THIS',
       localLogFile: 'CHANGE-THIS',
       bucketName: 'CHANGE-THIS'
    };

    e.preventDefault();
    this.setState({
      formData: 
      formDataValues
    }, 
    this.sendData(formDataValues));
    
    this.props.onDismiss();
    console.log("submitted form");
  }

  onCancel() {
    this.props.onDismiss();
  }

  //TODO: move form to another component
  //TODO: make all field required
  render() {
    return ( 
      <div class="AddCaptureForm">
      		<form class="capture-form">
            <h2>Add Capture</h2>
            <div class="form-element">
            <h4>Region:</h4>
            <input class="form-input" type="text" name="region" defaultValue="CHANGE-THIS" required/>
            </div>

            <div class="form-element">
            <h4>RDS Instance:</h4>
            <input class="form-input" type="text" name="rds_instance" defaultValue="CHANGE-THIS" required/>
            </div>

            <div class="form-element">
            <h4>Log File:</h4>
            <input class="form-input" type="text" name="log_file" defaultValue="CHANGE-THIS" required/>
            </div>

            <div class="form-element">
            <h4>Local Log File:</h4>
            <input class="form-input" type="text" name="local_log_file" defaultValue="CHANGE-THIS" required/>
            </div>

            <div class="form-element">
            <h4>S3 Bucket Name:</h4>
            <input class="form-input" type="text" name="bucket_name" defaultValue="CHANGE-THIS" required/>
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
              isSubmit={true}
            />
            </div>
          </div>
      	</div>
    );
  }
}

export default AddCaptureForm;