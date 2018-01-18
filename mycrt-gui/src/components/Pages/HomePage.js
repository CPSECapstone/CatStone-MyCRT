import React, { Component } from 'react';

import './HomePage.css';
import Button from './Button.js';
import CaptureReplayContainer from './CaptureReplayContainer.js';
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
      captureEndTime: undefined
    };


    // This binding is necessary to make `this` work in the callback
    this.showCaptureCallout = this.showCaptureCallout.bind(this);
    this.hideCaptureCallout = this.hideCaptureCallout.bind(this);
    this.showReplayCallout = this.showReplayCallout.bind(this);
    this.hideReplayCallout = this.hideReplayCallout.bind(this);
    this.handleRdsChange = this.handleRdsChange.bind(this);
    this.handleS3Change = this.handleS3Change.bind(this);
    this.handleStartDayChange = this.handleStartDayChange.bind(this);
    this.handleEndDayChange = this.handleEndDayChange.bind(this);
    this.isCaptureFieldsFilled = this.isCaptureFieldsFilled.bind(this);
    this.onCaptureButton = this.onCaptureButton.bind(this);
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
    this.setState(prevState => ({
      captureStartDay: value
    }))
    console.log(value);
  }

  handleEndDayChange(event, value) {
    this.setState(prevState => ({
      captureEndDay: value
    }))
    console.log(value);
  }

  isCaptureFieldsFilled() {
    //TODO: check for filled start/end time and alias values
    return this.state.rdsValue != undefined && this.state.s3Value != undefined
      && this.state.captureStartDay != undefined && this.state.captureEndDay != undefined;
  }

  onCaptureButton() {
    this.setState(prevState => ({
      s3Value: undefined,
      rdsValue: undefined,
      captureStartDay: undefined,
      captureEndDay: undefined
    }));
    this.hideCaptureCallout();
  }

  render() {
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
        onClick={this.onCaptureButton}
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
            <div class="add-capture-item">
              Capture Alias
               <TextField
                  hintText="Type alias here"
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
                  onChange={this.handleStartDayChange}
                />
                <TimePicker
                  hintText="Time"
                />
              </div>
            </div>
            <div class="add-capture-item">
              End Time
              <div class="capture-row">
                <DatePicker 
                  hintText="Day" 
                  onChange={this.handleEndDayChange}
                />
                <TimePicker
                  hintText="Time"
                />
              </div>
            </div>
          </div>
        </Dialog>
      	<CaptureReplayContainer />
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
      	<CaptureReplayContainer />
      </div>
    );
  }
}

export default HomePage;