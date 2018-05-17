import React, { Component } from 'react';

import './NavItem.css';

class NavItem extends Component {
  constructor(props) {
    super(props);
    this.onNavItemClick = this.onNavItemClick.bind(this);
  }

  onNavItemClick() {
    this.props.onNavItemClick(this.props.itemIdx);
  }

  render() {
    console.log("NavItem " + this.props.itemIdx);
    return (
      <div class={"nav-item" + (this.props.selected ? " nav-item-selected" : "")} onClick={this.onNavItemClick} href={this.props.href}>
        <div class={"glyphicon " + this.props.icon}/>
      	{!this.props.hidden &&
          <a>
        		{this.props.name}
        	</a>
        }
      </div>
    );
  }
}

export default NavItem;
