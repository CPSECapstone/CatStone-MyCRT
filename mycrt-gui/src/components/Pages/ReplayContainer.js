import React, { Component } from 'react';

import './ReplayContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

const NOT_STARTED = 0;
const IN_PROGRESS = 1;
const COMPLETED = 2;
const ERROR = 3;
const LOADING = 4;

class ReplayContainer extends Component {
  
  render() {
    var noContent = (this.props.cards !== undefined && this.props.cards.length === 0);
    return (
      <div className="ReplayContainer">
        {!noContent &&
          <div class = "replay-subcontainer">
          {this.props.cards.slice(0).reverse().map((card) => 
              <CaptureReplayItem
                key={card.replayAlias}
                alias={card.replayAlias}
                s3={card.s3Bucket}
                rds={card.rdsInstance}
                start={undefined}
                end={undefined}
                status={card.replayStatus}
                loading={this.props.showLoadingCard}
              />
          )}
          </div>
        }
        {noContent &&
          <div class="no-replays">
          {this.props.showLoadingContent &&
            <div>
            <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
              <h5>Loading...</h5>
            </div>
          }
          {!this.props.showLoadingContent && !this.props.errorFound &&
            <div>
              <h5>There are no current replays.</h5>
            </div>
          }
          {!this.props.showLoadingContent && this.props.errorFound &&
            <div>
              <h5>Encountered an error loading replays.</h5>
            </div>
          }
          </div>
        }
      </div>
    );
  }
}

export default ReplayContainer;