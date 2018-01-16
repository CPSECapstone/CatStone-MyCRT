import React, { Component } from 'react';

import './HomePage.css';
import Button from './Button.js';
import CaptureReplayContainer from './CaptureReplayContainer.js';
import AddCaptureForm from '../Forms/AddCaptureForm.js';
import AddReplayForm from '../Forms/AddReplayForm.js';
import Callout from './Callout.js';

class HomePage extends Component {
	constructor(props) {
    super(props);
    this.state = {isCaptureCalloutVisible: false};
    this.state = {isReplayCalloutVisible: false};

    // This binding is necessary to make `this` work in the callback
    this.showCaptureCallout = this.showCaptureCallout.bind(this);
    this.hideCaptureCallout = this.hideCaptureCallout.bind(this);
    this.showReplayCallout = this.showReplayCallout.bind(this);
    this.hideReplayCallout = this.hideReplayCallout.bind(this);
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

  render() {
    return (
      <div className="HomePage">
      	<h2>Dashboard</h2>
      	<h3>Captures</h3>
      	<Button 
      		onClick={this.showCaptureCallout}
      		content="Add Capture"
      	/>
      	{this.state.isCaptureCalloutVisible &&
      		<Callout class="add-capture-callout" 
      			isVisible={true} 
      			content={<AddCaptureForm
            			onDismiss = {this.hideCaptureCallout}
          			/>}
      		/>
      	}
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
            			onDismiss = {this.hideReplayCallout		                                   }
          			/>}
      		/>
      	}
      	<CaptureReplayContainer />
      </div>
    );
  }
}

export default HomePage;