import React, { Component } from 'react';

import './CaptureReplayItem.css';

var NOT_STARTED = 0;
var IN_PROGRESS = 1;
var COMPLETED = 2;
var ERROR = 3;

class CaptureReplayItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      captureReplayStatus: NOT_STARTED
    };
  }

  render() {
    var captureStatusText = "";
    var captureStatusTextClass = "";
    if (this.state.captureReplayStatus == NOT_STARTED) {
      captureStatusTextClass = "capture-not-started";
      captureStatusText = "Not Started";
    } else if (this.state.captureReplayStatus == IN_PROGRESS) {
      captureStatusTextClass = "capture-in-progress";
      captureStatusText = "In Progress";
    } else if (this.state.captureReplayStatus == COMPLETED) {
      captureStatusTextClass = "capture-complete";
      captureStatusText = "Complete";
    } else if (this.state.captureReplayStatus == ERROR) {
      captureStatusTextClass = "capture-error";
      captureStatusText = "Error Found";
    }
    var captureStatusBarClass = captureStatusTextClass + "-bar";

    return (
      <div className="CaptureReplayItem">
        <div class={"status-bar " + captureStatusBarClass} />
        <div class="capture-replay-item-content">
          <div class={captureStatusTextClass}>
            <h6>{captureStatusText}</h6>
          </div>
          <h4 class="capture-sub-item" >{this.props.alias}</h4>
          <h5 class="capture-sub-item" >RDS: {this.props.rds}</h5>
          <h5 class="capture-sub-item" >S3: {this.props.s3}</h5>
          <h5>Time Remaining: {this.props.end - (new Date())}</h5>
        </div>
      </div>
    );
  }
}

export default CaptureReplayItem;