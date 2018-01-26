import React, { Component } from 'react';

import './CaptureContainer.css';
import CaptureReplayItem from './CaptureReplayItem.js';

class CaptureContainer extends Component {
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
                s3={card.s3}
                rds={card.rds}
                end={card.end}
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