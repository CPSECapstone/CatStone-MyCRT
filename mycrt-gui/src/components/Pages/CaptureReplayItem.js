import React, { Component } from 'react';

import './CaptureReplayItem.css';

const NOT_STARTED = 0;
const IN_PROGRESS = 1;
const COMPLETED = 2;
const ERROR = 3;
const LOADING = 4;

var endTime = new Date();

class CaptureReplayItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      captureReplayStatus: ERROR,
      captureStopped: false
    };

    this.getTimeLeft = this.getTimeLeft.bind(this);
    this.onStopCaptureClick = this.onStopCaptureClick.bind(this);
  }

  /* Code used from a sample received from the following github link.
      https://gist.github.com/Erichain/6d2c2bf16fe01edfcffa
  */
  convertMS(milliseconds) {
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return {
        day: day,
        hour: hour,
        minute: minute,
        seconds: seconds
    };
}

  onStopCaptureClick() {
    this.setState({
      captureStopped: true
    })
  }

  getTimeLeft() {
    var currentDate = new Date();
    var currentEndTime = this.props.end;
  
    var timeLeft = Date.parse(currentEndTime) - Date.parse(currentDate);
    var timeToDisplay = this.convertMS(timeLeft);

    return timeLeft > 0 ? timeToDisplay["day"] + " D " + 
     timeToDisplay["hour"] + ":" + 
     timeToDisplay["minute"] + ":" + 
     timeToDisplay["seconds"] : "0D 00:00:00";
  }

  render() {
    var captureStatusText = "";
    var captureStatusTextClass = "";
    if (this.props.status === NOT_STARTED) {
      captureStatusTextClass = "capture-not-started";
      captureStatusText = "Not Started";
    } else if (this.props.status === IN_PROGRESS) {
      captureStatusTextClass = "capture-in-progress";
      captureStatusText = "In Progress";
    } else if (this.props.status === COMPLETED) {
      captureStatusTextClass = "capture-complete";
      captureStatusText = "Complete";
    } else if (this.props.status === ERROR) {
      captureStatusTextClass = "capture-error";
      captureStatusText = "Error Found";
    } else if (this.props.status === LOADING) {
      captureStatusTextClass = "capture-loading";
      captureStatusText = "Processing...";
    }
    var captureStatusBarClass = captureStatusTextClass + "-bar";

    return (
      <div>
        {this.props.loading && 
          <div className="CaptureReplayItem">
            <div class="capture-replay-item-content">
              <div class={"status-bar " + captureStatusTextClass + "-bar"} />
              <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
              <h5>Loading...</h5>
            </div>
          </div>
        }
        {!this.props.loading &&
          <div className="CaptureReplayItem">
            <div class={"status-bar " + captureStatusBarClass} />
            <div class="capture-replay-item-content">
              <div class={captureStatusTextClass}>
                <h6>{captureStatusText}</h6>
              </div>
              <h4 class="capture-sub-item" >{this.props.alias}</h4>
              <h5 class="capture-sub-item" >RDS: {this.props.rds}</h5>
              <h5 class="capture-sub-item" >S3: {this.props.s3}</h5>
              {this.props.start && this.props.end &&
                <div>
                <h5>Time Remaining:</h5>
                <h5>{this.getTimeLeft()}</h5>
                </div>
              }
              {!this.props.end && this.props.isCapture &&
                  <div class={this.state.captureStopped ? "stop-capture-button-disabled" : "stop-capture-button-active"} 
                    onClick={this.onStopCaptureClick}>
                    <div>{this.state.captureStopped ? "STOPPED" : "STOP"}</div>
                  </div>
              }
            </div>
          </div>
        }
      </div>
    );
  }
}

export default CaptureReplayItem;
