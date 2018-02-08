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
      var card = (this.props.cards)[0];
    }

    return (
      <div className="CaptureContainer">
        {this.props.cards.length > 0 &&
          <div class = "capture-subcontainer">
          {this.props.cards.slice(0).reverse().map((card) => 
              <CaptureReplayItem
                key={card.alias}
                alias={card.alias}
                s3={card.bucket_name}
                rds={card.rds_endpoint}
                start={card.start_time}
                end={card.end_time}
                status={this.getCaptureStatus(card.start_time, card.end_time)}
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