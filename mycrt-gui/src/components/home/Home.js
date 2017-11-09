import React, { Component } from 'react';

import './Home.css';
import AddButton from './AddButton.js';
import CaptureReplayContainer from './CaptureReplayContainer.js';

class Home extends Component {
  render() {
    return (
      <div className="Home">
         <main role="main" class="col-sm-9 ml-sm-auto col-md-10 pt-3">
            <h1>Dashboard</h1>
         </main>
      </div>
    );
  }
}

export default Home;