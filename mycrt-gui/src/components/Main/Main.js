import React, { Component } from 'react';
import logo from '../../logo.svg';
import './Main.css';

import Header from '../Header/Header.js';
import NavPage from '../Pages/NavPage.js';
import NavBar from '../Header/NavBar.js';
import LogIn from '../Pages/LogIn.js';
import HomePage from '../Pages/HomePage.js';
import ViewResults from '../Pages/ViewResults.js';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import $ from 'jquery';

import { Route, Switch, Redirect, Link } from 'react-router-dom';

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
  }]

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      loggedIn: false,
      token: undefined,
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

    this.props.history.push("/" + navLinks[idx].href);
    //window.location.hash = navLinks[idx].href;
  }

  onLogIn(token) {
    this.setState(prevState => ({
      loggedIn: true,
      token: token
    }));

    document.body.style.background = "#f7f7f7";
    this.props.history.push("/dashboard");
  }

  onLogOut() {
    this.setState(prevState => ({
      loggedIn: false,
      token: undefined
    }));

    document.body.style.background = "#333b44";
    this.props.history.push("/login");
  }

  render() {
    console.log("Im in App " + this.state.selected);
      return (
      <MuiThemeProvider>
      <div class="App">
        <Switch>
          <Route exact path='/' render={() => { 
            console.log("render " + this.state.selected)
            if (this.state.loggedIn) {
              return (
                <div>
                  <Redirect to={"/" + navLinks[this.state.selected].href}/>
                </div>
              );
            }
          }}/>
          <Route path='/dashboard' 
           render={() => (
            <div>
              <Header onLogOut={this.onLogOut}/>
              <div class="app-content">
                <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
                <NavPage selected={this.state.selected} parentContext={this}/>
              </div>
            </div>)
            }/>
          <Route path='/results'
           render={() => (
            <div>
              <Header onLogOut={this.onLogOut}/>
              <div class="app-content">
                <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
                <NavPage selected={this.state.selected} parentContext={this}/>
              </div>
            </div>)
            }/>
          <Route path='/login'
           render={() => <LogIn onLogIn={this.onLogIn} parentContext={this} />}/>
        </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Main;
