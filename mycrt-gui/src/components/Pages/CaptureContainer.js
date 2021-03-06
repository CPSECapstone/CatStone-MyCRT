import React, { Component } from 'react';

import './CaptureContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

const NOT_STARTED = 0;
const IN_PROGRESS = 1;
const COMPLETED = 2;
const ERROR = 3;
const LOADING = 4;

class CaptureContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    var noContent = (this.props.cards !== undefined && this.props.cards.length === 0);
    var that = this;
    
    return (
      <div className="CaptureContainer">
        {!noContent &&
          <div class = "capture-subcontainer">
          {this.props.cards.slice(0).reverse().map((card) => 
              <CaptureReplayItem
                key={card.captureAlias}
                id={card.captureId}
                alias={card.captureAlias}
                s3={card.s3Bucket}
                rds={card.rdsInstance}
                start={card.startTime}
                end={card.endTime}
                status={card.captureStatus}
                loading={this.props.showLoadingCard}
                isCapture={true}
                {...that.props}
              />
          )}
          </div>
        }
        {noContent &&
          <div class="no-captures">
          {this.props.showLoadingContent &&
            <div>
            <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
              <h5>Loading...</h5>
            </div>
          }
          {!this.props.showLoadingContent && !this.props.errorFound &&
            <div>
              <h5>There are no current captures.</h5>
            </div>
          }
          {!this.props.showLoadingContent && this.props.errorFound &&
            <div>
              <h5>Encountered an error loading captures.</h5>
            </div>
          }
          </div>
        }

      </div>
    );
  }
}

export default CaptureContainer;
