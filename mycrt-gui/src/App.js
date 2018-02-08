import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Header from './components/Header/Header.js';
import NavPage from './components/Pages/NavPage.js';
import NavBar from './components/Header/NavBar.js';
import LogIn from './components/Pages/LogIn.js';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import $ from 'jquery';

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
    this.state = {
      selected: 0,
      loggedIn: false
    };
    this.switchTab = this.switchTab.bind(this);
    this.onLogIn = this.onLogIn.bind(this);
    this.onLogOut = this.onLogOut.bind(this);

    document.body.style.background = "#333b44";
  }

  switchTab(idx) {
    // e.preventDefault();
    this.setState(prevState => ({
      selected: idx
    }));
    //window.location.hash = navLinks[idx].href;
  }

  onLogIn() {
    this.setState(prevState => ({
      loggedIn: true
    }));

    document.body.style.background = "#f7f7f7";
  }

  onLogOut() {
    this.setState(prevState => ({
      loggedIn: false
    }));

    document.body.style.background = "#333b44";
  }

  render() {
    console.log("Im in App " + this.state.selected);
    return (
      <MuiThemeProvider>
      <div class="App">
      {this.state.loggedIn &&
        <div>
        <Header onLogOut={this.onLogOut}/>
        <div class="app-content">
          <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
          <NavPage selected={this.state.selected}/>
        </div>
        </div>
      }
      {!this.state.loggedIn &&
        <LogIn 
          onLogIn={this.onLogIn}
          parentContext={this}
        />
      }
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
