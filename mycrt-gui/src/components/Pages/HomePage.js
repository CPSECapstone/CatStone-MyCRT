import React, { Component } from 'react';

import './HomePage.css';
import Button from './Button.js';
import CaptureReplayContainer from './CaptureReplayContainer.js';
import Callout from './Callout.js';

class HomePage extends Component {
	constructor(props) {
    super(props);
    this.state = {isCalloutVisible: false};

    // This binding is necessary to make `this` work in the callback
    this.showCallout = this.showCallout.bind(this);
    this.hideCallout = this.hideCallout.bind(this);
  }

  showCallout() {
    this.setState(prevState => ({
      isCalloutVisible: true
    }));
  }

  hideCallout() {
    this.setState(prevState => ({
      isCalloutVisible: false
    }));
  }

  render() {
    return (
      <div className="HomePage">
      	<h1>Dashboard</h1>
      	<h2>Captures</h2>
      	<Button 
      		onClick={this.showCallout}
      		content="Add Capture"
      	/>
      	{this.state.isCalloutVisible &&
      		<Callout class="add-capture-callout" isVisible={true} onDismiss={this.hideCallout}/>
      	}
      	<CaptureReplayContainer />
      	<h2>Replays</h2>
      	<Button 
      		onClick={this.showCallout}
      		content="Add Replay"
      	/>
      	<CaptureReplayContainer />
      </div>
    );
  }
}

export default HomePage;