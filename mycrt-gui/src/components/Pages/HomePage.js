import React, { Component } from 'react';

import './HomePage.css';
import Button from './Button.js';
import CaptureContainer from './CaptureContainer.js';
import ReplayContainer from './ReplayContainer.js';
import AddCaptureForm from '../Forms/AddCaptureForm.js';
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
      rdsValue: undefined,
      s3Value: undefined,
      aliasValue: undefined,
      captureStartDay: undefined,
      captureEndDay: undefined,
      isErrorVisible: false,
      captureCards: []
    };


    // This binding is necessary to make `this` work in the callback
    this.getRdsData = this.getRdsData.bind(this);

    this.showCaptureCallout = this.showCaptureCallout.bind(this);
    this.hideCaptureCallout = this.hideCaptureCallout.bind(this);
    this.showReplayCallout = this.showReplayCallout.bind(this);
    this.hideReplayCallout = this.hideReplayCallout.bind(this);

    this.handleRdsChange = this.handleRdsChange.bind(this);
    this.handleS3Change = this.handleS3Change.bind(this);
    this.handleStartDayChange = this.handleStartDayChange.bind(this);
    this.handleEndDayChange = this.handleEndDayChange.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
    this.handleAliasChange = this.handleAliasChange.bind(this);

    this.isCaptureFieldsFilled = this.isCaptureFieldsFilled.bind(this);
    this.onCaptureButton = this.onCaptureButton.bind(this);
    this.onCaptureSubmit = this.onCaptureSubmit.bind(this);
  }

  getRdsData() {
    $.getJSON( SERVER_PATH + "/rds" )
      .done(function( json ) {
        console.log( "JSON rds instances: " + json.rdsInstances );
        console.log( "JSON count: " + json.count );
      })
      .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
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
    console.log(newDate);
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

  isCaptureFieldsFilled() {
    return this.state.rdsValue != undefined && this.state.s3Value != undefined
      && this.state.captureStartDay != undefined && this.state.captureEndDay != undefined
      && this.state.aliasValue != undefined && !this.state.isErrorVisible;
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
    //TODO: send information to capture card
    var card = {
      alias: this.state.aliasValue,
      rds: this.state.rdsValue,
      s3: this.state.s3Value,
      start: this.state.captureStartDay,
      end: this.state.captureEndDay
    };
    var newCards = this.state.captureCards;
    newCards.push(card);
    this.setState(prevState => ({
      captureCards: newCards,
      isErrorVisible: false
    }))
    this.onCaptureButton();
  }

  render() {
    //TODO: refactor form to be a separate component
    this.getRdsData();

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

    const items = [];
    for (let i = 0; i < 100; i++ ) {
      items.push(<MenuItem value={i} key={i} primaryText={`Item ${i}`} />);
    }

    const dropdownStyle = {
      customWidth: {
        width: 300,
      },
    };

    return (
      <div className="HomePage">
      	<h2>Dashboard</h2>
      	<h3>Captures</h3>
      	<Button 
      		onClick={this.showCaptureCallout}
      		content="Add Capture"
      	/>
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
              Capture Alias
               <TextField
                  hintText="Type alias here"
                  onChange={this.handleAliasChange}
                />
            </div>
            <div class="add-capture-item">
              RDS Instance
              <DropDownMenu 
                style={dropdownStyle.customWidth}
                value={this.state.rdsValue} 
                onChange={this.handleRdsChange}>
                {items}
              </DropDownMenu>
            </div>
            <div class="add-capture-item">
               S3 Bucket
              <DropDownMenu 
                style={dropdownStyle.customWidth}
                maxHeight={300} 
                value={this.state.s3Value} 
                onChange={this.handleS3Change}>
                {items}
              </DropDownMenu>
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