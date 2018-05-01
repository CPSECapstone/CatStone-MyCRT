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
import Checkbox from 'material-ui/Checkbox';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';

import $ from 'jquery';

const rdsRegions = ["us-east-2", "us-east-1", "us-west-1", "us-west-2",
"ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
"ca-central-1",
"cn-north-1",
"eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
"sa-east-1"];

var SERVER_PATH = "http://localhost:5000";
var NOT_STARTED = 0;
var IN_PROGRESS = 1;
var COMPLETED = 2;
var ERROR = 3;
var LOADING = 4;

var rdsRegionItems = [];

for (var i = 0; i < rdsRegions.length; i++) {
  rdsRegionItems.push(<MenuItem value={rdsRegions[i]} key={rdsRegions[i]} primaryText={`${rdsRegions[i]}`} />)
}

class HomePage extends Component {
	constructor(props) {
    super(props);
    this.state = {
      isCaptureCalloutVisible: false,
      isReplayCalloutVisible: false,
      rdsLoading: false,
      regionSelected: false,
      rdsRegionValue: undefined,
      rdsValue: undefined,
      s3Value: undefined,
      aliasValue: undefined,
      dbUsernameValue: undefined,
      dbNameValue: undefined,
      dbPasswordValue: undefined,
      captureStartDay: undefined,
      captureEndDay: undefined,
      replayStartDay: undefined,
      replayStartTime: undefined,
      selectedCapture: "Select your capture",
      availableCaptures: undefined,
      fastReplay: true,
      isErrorVisible: false,
      captureCards: [],
      replayCards: [],
      rdsItems: [],
      s3Items: [],
      showLoadingCard: true,
      pausePolling: false,
      loadingCaptureContent: true,
      showReplayLoadingCard: true,
      pauseReplayPolling: false,
      loadingReplayContent: true,
      showDBConnectFailure: false,
      showAliasFailure: false
    };


    // This binding is necessary to make `this` work in the callback
    this.checkLoadingCard = this.checkLoadingCard.bind(this);
    this.getRdsData = this.getRdsData.bind(this);
    this.getS3Data = this.getS3Data.bind(this);
    this.getCaptureData = this.getCaptureData.bind(this);
    this.sendCaptureData = this.sendCaptureData.bind(this);

    this.showCaptureCallout = this.showCaptureCallout.bind(this);
    this.hideCaptureCallout = this.hideCaptureCallout.bind(this);
    this.showReplayCallout = this.showReplayCallout.bind(this);
    this.hideReplayCallout = this.hideReplayCallout.bind(this);
    this.onReplayClose = this.onReplayClose.bind(this);

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
    this.handleCaptureSelection = this.handleCaptureSelection.bind(this);

    this.isCaptureFieldsFilled = this.isCaptureFieldsFilled.bind(this);
    this.onCaptureButton = this.onCaptureButton.bind(this);
    this.onCaptureSubmit = this.onCaptureSubmit.bind(this);
    this.renderCaptureForm = this.renderCaptureForm.bind(this);
    this.renderReplayForm = this.renderReplayForm.bind(this);

    this.getSuccessfulCaptures = this.getSuccessfulCaptures.bind(this);
    this.onReplaySubmit = this.onReplaySubmit.bind(this);
    this.sendReplayData = this.sendReplayData.bind(this);
    this.getReplayData = this.getReplayData.bind(this);
    this.checkReplayLoadingCard = this.checkReplayLoadingCard.bind(this);
    this.isReplayFieldsFilled = this.isReplayFieldsFilled.bind(this);
  }

  componentDidMount() {
    if (!this.state.pausePolling) {
      var intervalGetAllCaptures = setInterval(this.getCaptureData, 1500);

      this.setState({
        intervalGetAllCaptures: intervalGetAllCaptures
      });
    }

    if (!this.state.pauseReplayPolling) {
      var intervalGetAllReplays = setInterval(this.getReplayData, 1500);

      this.setState({
        intervalGetAllReplays: intervalGetAllReplays
      });
    }

    var intervalShowLoadingCard = setInterval(this.checkLoadingCard, 1500);
    var intervalShowReplayLoadingCard = setInterval(this.checkReplayLoadingCard, 1500);

    this.setState({
      intervalShowLoadingCard: intervalShowLoadingCard
    });

    this.setState({
      intervalShowReplayLoadingCard: intervalShowReplayLoadingCard
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalGetAllCaptures);
    clearInterval(this.state.intervalGetAllReplays);
  }

  checkLoadingCard() {
    this.setState({
      showLoadingCard: this.state.captureCards.length <= 0
    });
  }

  checkReplayLoadingCard() {
    this.setState({
      showReplayLoadingCard: this.state.replayCards.length <= 0
    })
  }

  sendCaptureData(formDataValues) {
    var parentContextState = this.props.parentContext.state;
    this.setState({
      pausePolling: true
    });

    $.ajax({
      url: SERVER_PATH + "/users/captures",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'POST',
      data: JSON.stringify(formDataValues),
      success: function(data) {
        console.log("SUCCESS capture form");
        this.setState({
          pausePolling: false
        });
        var formattedCard = {
          captureAlias: this.state.aliasValue,
          rdsInstance: this.state.rdsValue,
          s3Bucket: this.state.s3Value,
          endTime: this.state.captureEndDay,
          startTime: this.state.captureStartDay,
          captureStatus: LOADING
        };
        var newCards = this.state.captureCards;
        newCards.push(formattedCard);
        this.setState(prevState => ({
          captureCards: newCards
        }))
        this.onCaptureButton();
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText.includes("Failed to connect")) {
          this.setState({
            showDBConnectFailure: true,
            showAliasFailure: false
          });
        } else if (xhr.responseText.includes("Alias is unavailable")) {
          this.setState({
            showAliasFailure: true,
            showDBConnectFailure: false
          });
        }
        console.error(this.props.url, status, err.toString(), xhr.responseText);
      }.bind(this)
    });
  }

  sendReplayData(formDataValues, startDay) {
    var parentContextState = this.props.parentContext.state;

    this.setState({
      pauseReplayPolling: true
    });

    $.ajax({
      url: SERVER_PATH + "/users/replays",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'POST',
      data: JSON.stringify(formDataValues),
      success: function(data) {
        console.log("SUCCESS Replay form");
        this.setState({
          pauseReplayPolling: false
        });
        var formattedCard = {
          replayAlias: this.state.aliasValue,
          rdsInstance: this.state.rdsValue,
          s3Bucket: this.state.s3Value,
          replayStatus: LOADING,
          startTime: startDay,
          is_fast: this.state.fastReplay
        }

        var newCards = this.state.replayCards;
        newCards.push(formattedCard);
        this.setState({
          replayCards: newCards
        })
        this.onReplayClose();
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText.includes("Failed to connect")) {
          this.setState({
            showDBConnectFailure: true,
            showAliasFailure: false
          });
        } else if (xhr.responseText.includes("Alias is unavailable")) {
          this.setState({
            showAliasFailure: true,
            showDBConnectFailure: false
          });
        }
        console.error(this.props.url, status, err.toString(), xhr.responseText);
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

    this.setState(prevState =>({
      loadingCaptureContent: false
    }));
  }

  getReplayData() {
    var parentContextState = this.props.parentContext.state;
    var component = this;

    $.ajax({
      url: SERVER_PATH + "/users/replays",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(json) {
        component.setState(prevState => ({replayCards: json["userReplays"]}));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

    this.setState(prevState =>({
      loadingReplayContent: false
    }));
  }

  getSuccessfulCaptures() {
    var parentContextState = this.props.parentContext.state;
    var component = this;

    $.ajax({
      url: SERVER_PATH + "/users/captures",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(json) {
        component.setState({successfulCaptures: json["userCaptures"].filter(capture => capture.captureStatus === 2)});
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
      rdsItems: [],
      rdsLoading:true
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
            rdsItems: newRdsItems,
            regionSelected:true,
            rdsLoading: false
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
    this.getSuccessfulCaptures();

    this.setState(prevState => ({
      isReplayCalloutVisible: true,
      isCaptureCalloutVisible: false
    }));
  }

  handleCaptureSelection(event, index, value) {
    this.setState(prevState => ({
      selectedCapture: value,
      selectedCaptureId: value.split(':')[0]
    }))
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

  isReplayFieldsFilled() {
    return this.state.selectedCaptureId !== undefined && this.state.aliasValue !== undefined
      && this.state.dbUsernameValue !== undefined && this.state.dbPasswordValue !== undefined
      && this.state.dbNameValue !== undefined && this.state.rdsRegionValue !== undefined
      && this.state.rdsValue !== undefined && this.state.s3Value !== undefined
      && (this.state.fastReplay ||
         (!this.state.fastReplay
         && (this.replayStartDay && this.replayStartDay.state.date)
         && (this.replayStartTime && this.replayStartTime.state.time)))
      && !this.state.isErrorVisible;
  }

  onCaptureButton() {
    this.setState(prevState => ({
      s3Value: undefined,
      rdsValue: undefined,
      rdsRegionValue: undefined,
      rdsLoading: false,
      regionSelected: false,
      captureStartDay: undefined,
      captureEndDay: undefined,
      isErrorVisible: false,
      showDBConnectFailure: false,
      showAliasFailure: false
    }));
    this.hideCaptureCallout();
  }

  onReplayClose() {
    this.setState(prevState => ({
      s3Value: undefined,
      rdsValue: undefined,
      rdsRegionValue: undefined,
      captureStartDay: undefined,
      captureEndDay: undefined,
      isErrorVisible: false,
      showDBConnectFailure: false,
      showAliasFailure: false,
      selectedCapture: undefined
    }));

    this.hideReplayCallout();
  }

  onCaptureSubmit() {
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
    this.setState(prevState => ({
      isErrorVisible: false
    }))
  }

  onReplaySubmit() {
    var startDay = this.replayStartDay && this.replayStartDay.state.date;
    var startTime = this.replayStartTime && this.replayStartTime.state.time;

    if (startDay) {
      startDay.setHours(startTime.getHours());
      startDay.setMinutes(startTime.getMinutes());
    }
    else {
      startDay = new Date().toISOString();
      console.log(startDay);
    }

    var replay = {
      capture_id: this.state.selectedCaptureId,
      replay_alias: this.state.aliasValue,
      db_user: this.state.dbUsernameValue,
      db_password: this.state.dbPasswordValue,
      db_name: this.state.dbNameValue,
      region_name: this.state.rdsRegionValue,
      rds_endpoint: this.state.rdsValue,
      bucket_name: this.state.s3Value,
      start_time: startDay,
      is_fast: this.state.fastReplay
    }

    this.sendReplayData(replay, startDay);
    this.setState({
      isErrorVisible: false
    })


  }

  renderCaptureForm() {
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
          <div class="rds-instance-item">
            <div>
              <div class="rds-instance-row">
                <div>
                  RDS Instance
                </div>
                {this.state.rdsLoading &&
                  <div>
                    <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                  </div>
                }
              </div>
              <div class="override-dropdown-width">
                <DropDownMenu
                  style={dropdownStyle.customWidth}
                  value={this.state.rdsValue}
                  disabled={this.state.rdsLoading || !this.state.regionSelected}
                  onChange={this.handleRdsChange}>
                  {this.state.rdsItems !== undefined ? this.state.rdsItems : []}
                </DropDownMenu>
              </div>
            </div>
          </div>
          <div class="add-capture-item">
             S3 Bucket
            <DropDownMenu
              style={dropdownStyle.customWidth}
              maxHeight={300}
              value={this.state.s3Value}
              onChange={this.handleS3Change}>
              {this.state.s3Items !== undefined ? this.state.s3Items : []}
            </DropDownMenu>
          </div>
          <div class="add-capture-item">
            Capture Alias
             <TextField
                hintText="Type alias here"
                onChange={this.handleAliasChange}
              />
          </div>
          {this.state.showAliasFailure &&
          <div class="error-message">
            Alias already in use, please provide an unique alias.
          </div>}
          <div class="add-capture-item">
            Database Name
             <TextField
                hintText="Type name here"
                onChange={this.handleDBNameChange}
              />
          </div>
          {this.state.showDBConnectFailure &&
          <div class="error-message">
            Database credentials are invalid, please check your input.
          </div>}
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

  renderReplayForm() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.onReplayClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={!this.isReplayFieldsFilled()}
        onClick={this.onReplaySubmit}
      />
    ];

    const dropdownStyle = {
      customWidth: {
        width: 300,
      },
    };

    var captureItems = this.state.successfulCaptures ? this.state.successfulCaptures.map(c =>
      <MenuItem value={c.captureId + ":" + c.captureAlias} key={c.captureId} primaryText={`${c.captureAlias}`}/>)
      : [];

    return (
      <Dialog title="Add Replay"
       actions={actions}
       modal={true}
       open={this.state.isReplayCalloutVisible}
       autoScrollBodyContent={true}>
         <div class="add-replay-item">
            Related Capture
            <DropDownMenu
              style={dropdownStyle.customWidth}
              value={this.state.selectedCapture}
              onChange={this.handleCaptureSelection}>
              {captureItems}
            </DropDownMenu>
         </div>
         <div class="add-replay-item">
            RDS Region
            <DropDownMenu
              style={dropdownStyle.customWidth}
              value={this.state.rdsRegionValue}
              onChange={this.handleRegionChange}>
              {rdsRegionItems !== undefined ? rdsRegionItems : []}
            </DropDownMenu>
          </div>
          <div class="rds-instance-item">
            <div>
              <div class="rds-instance-row">
                <div>
                  RDS Instance
                </div>
                {this.state.rdsLoading &&
                  <div>
                    <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                  </div>
                }
              </div>
              <div class="override-dropdown-width">
                <DropDownMenu
                  style={dropdownStyle.customWidth}
                  value={this.state.rdsValue}
                  disabled={this.state.rdsLoading || !this.state.regionSelected}
                  onChange={this.handleRdsChange}>
                  {this.state.rdsItems !== undefined ? this.state.rdsItems : []}
                </DropDownMenu>
              </div>
            </div>
          </div>
          <div class="add-replay-item">
             S3 Bucket
            <DropDownMenu
              style={dropdownStyle.customWidth}
              maxHeight={300}
              value={this.state.s3Value}
              onChange={this.handleS3Change}>
              {this.state.s3Items !== undefined ? this.state.s3Items : []}
            </DropDownMenu>
          </div>
          <div class="add-replay-item">
            Replay Alias
             <TextField
                hintText="Type alias here"
                onChange={this.handleAliasChange}
              />
          </div>
          {this.state.showAliasFailure &&
          <div class="error-message">
            Alias already in use, please provide an unique alias.
          </div>}
          <div class="add-replay-item">
            Database Name
             <TextField
                hintText="Type name here"
                onChange={this.handleDBNameChange}
              />
          </div>
          {this.state.showDBConnectFailure &&
          <div class="error-message">
            Database credentials are invalid, please check your input.
          </div>}
          <div class="add-replay-item">
            Database Username
             <TextField
                hintText="Type username here"
                onChange={this.handleDBUsernameChange}
              />
          </div>
          <div class="add-replay-item">
            Database Password
             <TextField
                hintText="Type password here"
                onChange={this.handleDBPasswordChange}
                type="password"
              />
          </div>
          <div class="add-replay-item">
             Fast Replay (Transactions run successively)
             <Checkbox
                 label="Fast Replay"
                 checked={this.state.fastReplay}
                 disabled={false}
                 onCheck={() => this.setState({fastReplay: !this.state.fastReplay})}/>
          </div>
          {!this.state.fastReplay ?
            <div class="add-replay-item">
              Start Time
              <div class="replay-row">
                <DatePicker
                  hintText="Day"
                  ref={(input) => {this.replayStartDay = input;}}
                />
                <TimePicker
                  hintText="Time"
                  ref={(input) => {this.replayStartTime = input;}}
                />
              </div>
            </div>
            :
            ''
          }
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
          showLoadingCard={this.state.showLoadingCard}
          showLoadingContent={this.state.loadingCaptureContent}
        />
      	<h3>Replays</h3>
      	<Button
      		onClick={this.showReplayCallout}
      		content="Add Replay"
      	/>
      	{this.renderReplayForm()}
      	<ReplayContainer
          cards={this.state.replayCards}
          showLoadingCard={this.state.showReplayLoadingCard}
          showLoadingContent={this.state.loadingReplayContent}
        />
      </div>
    );
  }
}

export default HomePage;
