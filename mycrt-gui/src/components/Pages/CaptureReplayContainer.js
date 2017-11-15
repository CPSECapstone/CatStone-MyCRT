import React, { Component } from 'react';

import './CaptureReplayContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

class CaptureReplayContainer extends Component {
  render() {
    return (
      <div className="CaptureReplayContainer">
        <CaptureReplayItem/>
        <CaptureReplayItem/>
        <CaptureReplayItem/>
        <CaptureReplayItem/>
        <CaptureReplayItem/>
        <CaptureReplayItem/>
        <CaptureReplayItem/>
        <CaptureReplayItem/>
      </div>
    );
  }
}

export default CaptureReplayContainer;