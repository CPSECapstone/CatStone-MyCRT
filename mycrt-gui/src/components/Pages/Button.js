import React, { Component } from 'react';
import './Button.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

class Button extends Component {
  render() {
    return ( 
      <div class="Button" onClick={this.props.onClick}>
        {this.props.content}
      </div>
    );
  }
}

export default Button;