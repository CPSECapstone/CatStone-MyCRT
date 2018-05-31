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
    icon: "glyphicon-dashboard",
    selected: true
  },
  {
    name: "View Results",
    href: "results",
    idx: 1,
    icon: "glyphicon-th-list",
    selected: false
  }]

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      loggedIn: false,
      token: undefined,
      isNavHidden: false
    };
    this.switchTab = this.switchTab.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.toggleNavBar = this.toggleNavBar.bind(this);
  }

  componentWillMount() {
    if (this.props.User && this.props.User.token) {
      this.props.setToken(this.props.User.token);
    }
  }

  toggleNavBar() {
    var oldHidden = this.state.isNavHidden;
    this.setState(prevState => ({
      isNavHidden: !oldHidden
    }));
  }

  isLoggedIn() {
    return (this.props.User && this.props.User.token);
  }

  switchTab(idx) {
    // e.preventDefault();
    this.setState(prevState => ({
      selected: idx
    }));

    for (var i in navLinks) {
      navLinks[i].selected = false;
    }
    navLinks[idx].selected = true;

    this.props.history.push("/" + navLinks[idx].href);
    //window.location.hash = navLinks[idx].href;
  }

  render() {
    var that = this;

    return (
      <MuiThemeProvider>
        <div class="App">
          <Switch>
            <Route exact path='/' render={() => {
              console.log("render " + this.state.selected)
              if (this.state.loggedIn || (this.props.User && this.props.User.token)) {
                return (
                  <Redirect to={"/" + navLinks[this.state.selected].href} />
                );
              }
              return (
                <Redirect to="/login" />
              );
            }} />
            <Route path='/dashboard'
              render={() => {
                if (this.isLoggedIn()) {
                  return (<div>
                    <Header onLogOut={() => that.props.logOut(() => {that.props.history.push("/login")})} {...this.props} />
                    <div class="app-content">
                      <NavBar navLinks={navLinks} switchTab={this.switchTab} isHidden={this.state.isNavHidden} toggleBar={this.toggleNavBar} />
                      <NavPage selected={0} parentContext={this} {...this.props} isNavBarHidden={this.state.isNavHidden} />
                    </div>
                  </div>)
                }
                else {
                  return (<Redirect to="/login" />)
                }
              }
              } />
            <Route path='/results'
              render={() => {
                if (this.isLoggedIn()) {
                  return (
                    <div>
                      <Header onLogOut={() => that.props.logOut(() => that.props.history.push("/login"))} {...this.props} />
                      <div class="app-content">
                        <NavBar navLinks={navLinks} switchTab={this.switchTab} isHidden={this.state.isNavHidden} toggleBar={this.toggleNavBar} />
                        <NavPage selected={1} parentContext={this} {...this.props} isNavHidden={false} isNavBarHidden={this.state.isNavHidden} />
                      </div>
                    </div>)
                }
                else {
                  return (<Redirect to="/login" />)
                }
              }

              } />
            <Route path='/login'
              render={() => <LogIn onLogIn={this.onLogIn} parentContext={this} {...this.props} />} />
            <Redirect from="*" to=".."/>
          </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Main;
