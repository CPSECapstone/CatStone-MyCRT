import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Header from './components/Header/Header.js';
import NavPage from './components/Pages/NavPage.js';
import NavBar from './components/Header/NavBar.js';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const WINDOW_HREF = window.location.href;

var navLinks = [
  {
    name: "Dashboard",
    href: "dashboard",
    idx: 0,
    icon: "glyphicon-dashboard"
  },
  {
    name: "View Results",
    href: "results",
    idx: 1,
    icon: "glyphicon-th-list"
  },
  {
    name: "Compare",
    href: "compare",
    idx: 2,
    icon: "glyphicon-eye-open"
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
    window.location.hash = navLinks[idx].href;
  }

  render() {
    console.log("Im in App " + this.state.selected);
    return (
      <MuiThemeProvider>
      <div class="App">
        <Header/>
        <div class="app-content">
          <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
          <NavPage selected={this.state.selected}/>
        </div>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
