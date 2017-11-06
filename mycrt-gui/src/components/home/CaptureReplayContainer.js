import React, { Component } from 'react';

import './CaptureReplayContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

class CaptureReplayContainer extends Component {
  render() {
    return (
      <div className="CaptureReplayContainer">
        items here
        <CaptureReplayItem/>
      </div>
    );
  }
}

export default CaptureReplayContainer;