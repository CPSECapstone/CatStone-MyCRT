import React, { Component } from 'react';

import './HomePage.css';
import Button from './Button.js';
import CaptureContainer from './CaptureContainer.js';
import ReplayContainer from './ReplayContainer.js';
import AddReplayForm from '../Forms/AddReplayForm.js';
import Callout from './Callout.js';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';

import $ from 'jquery';

var SERVER_PATH = "http://localhost:5000";

class HomePage extends Component {
	constructor(props) {
    super(props);
    this.state = {
      isCaptureCalloutVisible: false,
      isReplayCalloutVisible: false,
      rdsRegionValue: "Select your region",
      rdsValue: undefined,
      s3Value: undefined,
      aliasValue: undefined,
      dbUsernameValue: undefined,
      dbNameValue: undefined,
      dbPasswordValue: undefined,
      captureStartDay: undefined,
      captureEndDay: undefined,
      isErrorVisible: false,
      captureCards: [],
      rdsItems: [],
      s3Items: []
    };


    // This binding is necessary to make `this` work in the callback
    this.getRdsData = this.getRdsData.bind(this);
    this.getS3Data = this.getS3Data.bind(this);
    this.getCaptureData = this.getCaptureData.bind(this);
    this.sendCaptureData = this.sendCaptureData.bind(this);

    this.showCaptureCallout = this.showCaptureCallout.bind(this);
    this.hideCaptureCallout = this.hideCaptureCallout.bind(this);
    this.showReplayCallout = this.showReplayCallout.bind(this);
    this.hideReplayCallout = this.hideReplayCallout.bind(this);

    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleRdsChange = this.handleRdsChange.bind(this);
    this.handleS3Change = this.handleS3Change.bind(this);
    this.handleStartDayChange = this.handleStartDayChange.bind(this);
    this.handleEndDayChange = this.handleEndDayChange.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
    this.handleAliasChange = this.handleAliasChange.bind(this);
    this.handleDBUsernameChange = this.handleDBUsernameChange.bind(this);
    this.handleDBPasswordChange = this.handleDBPasswordChange.bind(this);
    this.handleDBNameChange = this.handleDBNameChange.bind(this);

    this.isCaptureFieldsFilled = this.isCaptureFieldsFilled.bind(this);
    this.onCaptureButton = this.onCaptureButton.bind(this);
    this.onCaptureSubmit = this.onCaptureSubmit.bind(this);
    this.renderCaptureForm = this.renderCaptureForm.bind(this);
  }

  componentDidMount() {
    var intervalGetAllCaptures = setInterval(this.getCaptureData, 1500);

    this.setState({intervalGetAllCaptures: intervalGetAllCaptures});
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalGetAllCaptures);
  }

  sendCaptureData(formDataValues) {
    var parentContextState = this.props.parentContext.state;

    $.ajax({
      url: SERVER_PATH + "/users/captures",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'POST',
      data: JSON.stringify(formDataValues),
      success: function(data) {
        console.log("SUCCESS capture form");
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  getCaptureData() {
    var parentContextState = this.props.parentContext.state;
    var component = this;

    $.ajax({
      url: SERVER_PATH + "/users/captures",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(json) {
        component.setState(prevState => ({captureCards: json["userCaptures"]}));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  getS3Data() {
    var parentContextState = this.props.parentContext.state;

    this.setState(prevState =>({
      s3Items: []
    }));

    $.ajax({
      url: SERVER_PATH + "/users/s3Buckets",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(data) {
        if (data.s3Instances != undefined) {
          var s3Arr = data.s3Instances;
          var newS3Items = [];
          for (let i = 0; i < s3Arr.length; i++ ) {
            newS3Items.push(<MenuItem value={s3Arr[i]} key={i} primaryText={`${s3Arr[i]}`} />);
          }
          this.setState(prevState => ({
            s3Items: newS3Items
          }));
        }
      }.bind(this),
      error: function(xhr, status, err) {
        var err = status + ", " + err;
        console.log("Request Failed: " + err);
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

  }

  getRdsData(value) {
    var parentContextState = this.props.parentContext.state;

    this.setState(prevState =>({
      rdsItems: []
    }));

    $.ajax({
      url: SERVER_PATH + "/users/rdsInstances/" + value,
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(data) {
        if (data.rdsInstances != undefined) {
          var rdsArr = data.rdsInstances;
          var newRdsItems = [];
          for (let i = 0; i < rdsArr.length; i++ ) {
            newRdsItems.push(<MenuItem value={rdsArr[i]} key={i} primaryText={`${rdsArr[i]}`} />);
          }
          this.setState(prevState => ({
            rdsItems: newRdsItems
          }));
        }
      }.bind(this),
      error: function(xhr, status, err) {
        var err = status + ", " + err;
        console.log( "Request Failed: " + err );
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  showCaptureCallout() {
    this.setState(prevState => ({
      isCaptureCalloutVisible: true,
      isReplayCalloutVisible: false
    }));
  }

  hideCaptureCallout() {
    this.setState(prevState => ({
      isCaptureCalloutVisible: false
    }));
  }

  showReplayCallout() {
    this.setState(prevState => ({
      isReplayCalloutVisible: true,
      isCaptureCalloutVisible: false
    }));
  }

  hideReplayCallout() {
    this.setState(prevState => ({
      isReplayCalloutVisible: false
    }));
  }

  handleRegionChange(event, index, value) {
    this.getRdsData(value);
    this.getS3Data();

    this.setState(prevState => ({
      rdsRegionValue: value
    }));
  }
  handleRdsChange(event, index, value) {
    this.setState(prevState => ({
      rdsValue: value
    }));
  }

  handleS3Change(event, index, value) {
    this.setState(prevState => ({
      s3Value: value
    }));
  }

  handleStartDayChange(event, value) {
    if (this.state.captureStartDay != undefined) {
      var newDate = this.state.captureStartDay;
      newDate.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
    } else {
      var newDate = value;
    }

    this.setState(prevState => ({
      captureStartDay: newDate
    }))
  }

  handleEndDayChange(event, value) {
    if (this.state.captureEndDay != undefined) {
      var newDate = this.state.captureEndDay;
      newDate.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
    } else {
      var newDate = value;
    }

    // check if end date is after start date
    var newDateWithBuffer = newDate;
    newDateWithBuffer.setMinutes(newDate.getMinutes() - 1);
    if (this.state.captureStartDay != undefined && newDateWithBuffer <= this.state.captureStartDay) {
      this.setState(prevState => ({
        isErrorVisible: true
      }))
    } else {
      this.setState(prevState => ({
        captureEndDay: newDate,
        isErrorVisible: false
      }))
    }
    console.log(newDate);
  }

  handleStartTimeChange(event, value) {
    if (this.state.captureStartDay != undefined) {
      var newDate = this.state.captureStartDay;
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
    } else {
      var newDate = value;
    }

    this.setState(prevState => ({
      captureStartDay: newDate
    }))
    console.log(newDate);
  }

  handleEndTimeChange(event, value) {
    if (this.state.captureEndDay != undefined) {
      var newDate = this.state.captureEndDay;
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
    } else {
      var newDate = value;
    }

    // check if end date is after start date
    var newDateWithBuffer = newDate;
    newDateWithBuffer.setMinutes(newDate.getMinutes() - 1);
    if (this.state.captureStartDay != undefined && newDateWithBuffer <= this.state.captureStartDay) {
      this.setState(prevState => ({
        isErrorVisible: true
      }))
    } else {
      this.setState(prevState => ({
        captureEndDay: newDate,
        isErrorVisible: false
      }))
    }
    console.log(newDate);
  }

  handleAliasChange(event, value) {
    this.setState(prevState => ({
      aliasValue: value
    }))
  }

  handleDBUsernameChange(event, value) {
    this.setState(prevState => ({
      dbUsernameValue: value
    }))
  }

  handleDBNameChange(event, value) {
    this.setState(prevState => ({
      dbNameValue: value
    }))
  }

  handleDBPasswordChange(event, value) {
    this.setState(prevState => ({
      dbPasswordValue: value
    }))
  }

  isCaptureFieldsFilled() {
    return this.state.rdsValue != undefined && this.state.s3Value != undefined
      && this.state.captureStartDay != undefined && this.state.captureEndDay != undefined
      && this.state.dbUsernameValue != undefined && this.state.dbNameValue != undefined
      && this.state.dbPasswordValue != undefined && this.state.aliasValue != undefined
      && !this.state.isErrorVisible;
  }

  onCaptureButton() {
    this.setState(prevState => ({
      s3Value: undefined,
      rdsValue: undefined,
      captureStartDay: undefined,
      captureEndDay: undefined,
      isErrorVisible: false
    }));
    this.hideCaptureCallout();
  }

  onCaptureSubmit() {
    //TODO: send information from API to capture card
    var card = {
      alias: this.state.aliasValue,
      db_user: this.state.dbUsernameValue,
      db_password: this.state.dbPasswordValue,
      db_name: this.state.dbNameValue,
      region_name: this.state.rdsRegionValue,
      rds_endpoint: this.state.rdsValue,
      bucket_name: this.state.s3Value,
      end_time: this.state.captureEndDay,
      start_time: this.state.captureStartDay
    };
    this.sendCaptureData(card);
    // this.getCaptureData();

    var newCards = this.state.captureCards;
    newCards.push(card);
    this.setState(prevState => ({
      captureCards: newCards,
      isErrorVisible: false
    }))
    this.onCaptureButton();
  }

  renderCaptureForm() {
    const rdsRegions = ["us-east-2", "us-east-1", "us-west-1", "us-west-2",
                        "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
                        "ca-central-1",
                        "cn-north-1",
                        "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
                        "sa-east-1"];
    var rdsRegionItems = [];

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.onCaptureButton}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={!this.isCaptureFieldsFilled()}
        onClick={this.onCaptureSubmit}
      />
    ];

    const dropdownStyle = {
      customWidth: {
        width: 300,
      },
    };

    for (var i = 0; i < rdsRegions.length; i++) {
      rdsRegionItems.push(<MenuItem value={rdsRegions[i]} key={i} primaryText={`${rdsRegions[i]}`} />)
    }

    return (
      <Dialog
        title="Add Capture"
        actions={actions}
        modal={true}
        open={this.state.isCaptureCalloutVisible}
        autoScrollBodyContent={true}
      >
        <div class="add-capture-content">
          <div class="notif-message">
            Ensure that General Logging is enabled before starting a capture.
          </div>
          <div class="add-capture-item">
            RDS Region
            <DropDownMenu
              style={dropdownStyle.customWidth}
              value={this.state.rdsRegionValue}
              onChange={this.handleRegionChange}>
              {rdsRegionItems !== undefined ? rdsRegionItems : []}
            </DropDownMenu>
          </div>
          <div class="add-capture-item">
            RDS Instance
            <DropDownMenu
              style={dropdownStyle.customWidth}
              value={this.state.rdsValue}
              onChange={this.handleRdsChange}>
              {this.state.rdsItems != undefined ? this.state.rdsItems : []}
            </DropDownMenu>
          </div>
          <div class="add-capture-item">
             S3 Bucket
            <DropDownMenu
              style={dropdownStyle.customWidth}
              maxHeight={300}
              value={this.state.s3Value}
              onChange={this.handleS3Change}>
              {this.state.s3Items != undefined ? this.state.s3Items : []}
            </DropDownMenu>
          </div>
          <div class="add-capture-item">
            Capture Alias
             <TextField
                hintText="Type alias here"
                onChange={this.handleAliasChange}
              />
          </div>
          <div class="add-capture-item">
            Database Name
             <TextField
                hintText="Type name here"
                onChange={this.handleDBNameChange}
              />
          </div>
          <div class="add-capture-item">
            Database Username
             <TextField
                hintText="Type username here"
                onChange={this.handleDBUsernameChange}
              />
          </div>
          <div class="add-capture-item">
            Database Password
             <TextField
                hintText="Type password here"
                onChange={this.handleDBPasswordChange}
                type="password"
              />
          </div>
          <div class="add-capture-item">
            Start Time
            <div class="capture-row">
              <DatePicker
                hintText="Day"
                value={this.state.captureStartDay}
                onChange={this.handleStartDayChange}
              />
              <TimePicker
                hintText="Time"
                value={this.state.captureStartDay}
                onChange={this.handleStartTimeChange}
              />
            </div>
          </div>
          {this.state.isErrorVisible &&
            <div class="error-message">
              End time must be at least one minute after start time.
            </div>
          }
          <div class="add-capture-item">
            End Time
            <div class="capture-row">
              <DatePicker
                hintText="Day"
                value={this.state.captureEndDay}
                onChange={this.handleEndDayChange}
              />
              <TimePicker
                hintText="Time"
                value={this.state.captureEndDay}
                onChange={this.handleEndTimeChange}
              />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  render() {
    return (
      <div className="HomePage">
      	<h2>Dashboard</h2>
      	<h3>Captures</h3>
      	<Button
      		onClick={this.showCaptureCallout}
      		content="Add Capture"
      	/>
        { this.renderCaptureForm() }
      	<CaptureContainer
          cards={this.state.captureCards}
          sampleDate={this.state.captureEndDay}
        />
      	<h3>Replays</h3>
      	<Button
      		onClick={this.showReplayCallout}
      		content="Add Replay"
      	/>
      	{this.state.isReplayCalloutVisible &&
      		<Callout class="add-replay-callout"
      			isVisible={true}
      			content={<AddReplayForm
            			onDismiss = {this.hideReplayCallout}
          			/>}
      		/>
      	}
      	<ReplayContainer
        />
      </div>
    );
  }
}

export default HomePage;
