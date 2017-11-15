import React, { Component } from 'react';

import './HomePage.css';
import AddButton from './AddButton.js';
import CaptureReplayContainer from './CaptureReplayContainer.js';

class HomePage extends Component {
  render() {
    return (
      <div className="HomePage">
      	<h1>Dashboard</h1>
      	<h2>Captures</h2>
      	<AddButton />
      	<CaptureReplayContainer />
      	<h2>Replays</h2>
      	<AddButton />
      	<CaptureReplayContainer />
      </div>
    );
  }
}

export default HomePage;