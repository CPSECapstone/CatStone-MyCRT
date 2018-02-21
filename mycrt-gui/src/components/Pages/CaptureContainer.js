import React, { Component } from 'react';

import './CaptureContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

var NOT_STARTED = 0;
var IN_PROGRESS = 1;
var COMPLETED = 2;
var ERROR = 3;

class CaptureContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.getCaptureStatus = this.getCaptureStatus.bind(this);
  }

  getCaptureStatus(start, end) {
    //TODO: Poll for status, possibly move this to CaptureReplayItem.js
    var now = new Date();
    var status = NOT_STARTED;

    console.log("Now: " + now);
    console.log("Start: " + start);
    console.log("End: " + end);

    if (start >= now) {
      status = (end <= now) ? COMPLETED : IN_PROGRESS;
    }

    return status;
  }

  render() {
    var card = undefined;
    if (this.props.cards != undefined && this.props.cards.length > 0) {
      card = (this.props.cards)[0];
    }

    return (
      <div className="CaptureContainer">
        {this.props.cards.length > 0 &&
          <div class = "capture-subcontainer">
          {this.props.cards.slice(0).reverse().map((card) => 
              <CaptureReplayItem
                key={card.captureAlias}
                alias={card.captureAlias}
                s3={card.s3Bucket}
                rds={card.rdsInstance}
                start={card.startTime}
                end={card.endTime}
                status={card.captureStatus}
              />
          )}
          </div>
        }
        {this.props.cards.length == 0 &&
          <div class = "no-captures">
            <h5>There are no current captures.</h5>
          </div>
        }

      </div>
    );
  }
}

export default CaptureContainer;