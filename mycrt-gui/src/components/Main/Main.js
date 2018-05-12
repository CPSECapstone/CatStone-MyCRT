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

  render() {
    console.log("Im in App " + this.state.selected);
    var that = this;

      return (
      <MuiThemeProvider>
      <div class="App">
        <Switch>
          <Route exact path='/' render={() => { 
            console.log("render " + this.state.selected)
            if (this.state.loggedIn) {
              return (
                <Redirect to={"/" + navLinks[this.state.selected].href}/>
              );
            }
            return (
              <Redirect to="/login"/>
            );
          }}/>
          <Route path='/dashboard' 
           render={() => (
            <div>
              <Header logOut={() => that.props.logOut(() => that.props.history.push("/login"))}/>
              <div class="app-content">
                <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
                <NavPage selected={this.state.selected} parentContext={this} {...this.props}/>
              </div>
            </div>)
            }/>
          <Route path='/results'
           render={() => (
            <div>
              <Header onLogOut={this.onLogOut}/>
              <div class="app-content">
                <NavBar navLinks={navLinks} switchTab={this.switchTab}/>
                <NavPage selected={this.state.selected} parentContext={this} {...this.props}/>
              </div>
            </div>)
            }/>
          <Route path='/login'
           render={() => <LogIn onLogIn={this.onLogIn} parentContext={this} {...this.props}/>}/>
        </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Main;
