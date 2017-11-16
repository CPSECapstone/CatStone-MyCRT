import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Header from './components/header/Header.js';
import NavPage from './components/Pages/NavPage.js';
import NavBar from './components/header/NavBar.js';

var navLinks = [
  {
    name: "Home",
    href: "#",
    idx: 0
  },
  {
    name: "View Results",
    href: "#",
    idx: 1
  },
  {
    name: "Compare",
    href: "#",
    idx: 2
  }]

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {selected: 0};
    this.switchTab = this.switchTab.bind(this);
  }

  switchTab(idx) {
    // e.preventDefault();
    this.setState({selected: idx});
  }

  render() {
    console.log("Im in App " + this.state.selected);
    return (
      <div class="App">
        <Header/>
        <div class="app-content">
          <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
          <NavPage selected={this.state.selected}/>
        </div>
      </div>
    );
  }
}

export default App;
