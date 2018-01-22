import React, { Component } from 'react';

import './ReplayContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

class ReplayContainer extends Component {
  render() {
    return (
      <div className="ReplayContainer">
          <div class = "no-replays">
            <h5>There are no current replays.</h5>
          </div>
      </div>
    );
  }
}

export default ReplayContainer;