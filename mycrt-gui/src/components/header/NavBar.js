import React, { Component } from 'react';
import NavItem from './NavItem';

import './NavBar.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

class NavBar extends Component {
  render() {
    // var createLinkItem = function(item, index) {
    //   return (<NavItem 
    //     key={index} 
    //     href={item.href} 
    //     name={item.name}
    //   />);
    // };
    console.log("NavBar " + this.props.navLinks[1].idx);
    return (
      <div class="Nav-Bar">
        {this.props.navLinks.map((item) => 
            <NavItem 
            href={item.href} 
            name={item.name}
            itemIdx={item.idx} 
            onNavItemClick={this.props.switchTab}
          />
      )}
      </div>
    );
  }
}

export default NavBar;