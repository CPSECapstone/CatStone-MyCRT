import React, { Component } from 'react';

import './CaptureReplayForm.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from '../Pages/Button.js';
import $ from 'jquery';

class AddCaptureForm extends Component {
	constructor(props) {
    super(props);
    this.state = {
      testy: "",
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

  sendData() {
    console.log(this.state.formData);
    $.ajax({
      url: 'http://localhost:5000/capture',
      dataType: 'json',
      type: 'POST',
      data: this.state.formData,
      success: function(data) {
        console.log("successful form");
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({
      formData: 
      {
        region: 'us-west-1',
        rdsInstance: 'testdb',
        logFile: 'general/mysql-general.log',
        localLogFile: 'log',
        bucketName: 'crt-bucket'
      }
    });
    this.setState({testy: "hahahahaha"});
    this.sendData();
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
            <input class="form-input" type="text" name="region" defaultValue="us-west-1" required/>
            </div>

            <div class="form-element">
            <h4>RDS Instance:</h4>
            <input class="form-input" type="text" name="rds_instance" defaultValue="testdb" required/>
            </div>

            <div class="form-element">
            <h4>Log File:</h4>
            <input class="form-input" type="text" name="log_file" defaultValue="general/mysql-general.log" required/>
            </div>

            <div class="form-element">
            <h4>Local Log File:</h4>
            <input class="form-input" type="text" name="local_log_file" defaultValue="log" required/>
            </div>

            <div class="form-element">
            <h4>S3 Bucket Name:</h4>
            <input class="form-input" type="text" name="bucket_name" defaultValue="crt-bucket" required/>
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