import React, { Component } from 'react';
import NavItem from './NavItem';

import './NavBar.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

class NavBar extends Component {
  render() {
    return (
      <div class={"Nav-Bar" + (this.props.isHidden ? " Nav-Bar-hidden" : "")}>
        {this.props.navLinks.map((item) => 
            <NavItem 
            href={item.href} 
            name={item.name}
            itemIdx={item.idx} 
            key={item.idx}
            icon={item.icon}
            onNavItemClick={this.props.switchTab}
            selected={item.selected}
            hidden={this.props.isHidden}
          />
        )}
        <div class={"hide-nav-bar glyphicon" + (this.props.isHidden ? " glyphicon-menu-right" : " glyphicon-menu-left")}
          onClick={this.props.toggleBar}></div>
      </div>
    );
  }
}

export default NavBar;
