import React, { Component } from 'react';
import './Button.css';

import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

class Button extends Component {
  render() {
  	if (this.props.isSubmit) {
  	   return (
    	<input type="submit" value={this.props.content} class="Button" onClick={this.props.onClick} />
        );	
  	}
    else {
       return (
       <div class="Button" onClick={this.props.onClick}>
          {this.props.content}
       </div>
      );
    }
  }
}

export default Button;