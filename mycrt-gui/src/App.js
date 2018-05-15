import React, { Component } from 'react';
import logo from './logo.svg';

import Header from './components/Header/Header.js';
import NavPage from './components/Pages/NavPage.js';
import NavBar from './components/Header/NavBar.js';
import LogIn from './components/Pages/LogIn.js';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import $ from 'jquery';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actionCreators from './actions/actionCreators';
import Main from './components/Main/Main';

// Properties to pass to Main
function mapStateToProps(state) {
   console.log("State is " + JSON.stringify(state));
   //returning reducers
   return {
       User: state.User,
       Capture: state.Capture,
       Replays: state.Replays,
       S3Buckets: state.S3Buckets,
       RDSInstances: state.RDSInstances
   };
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

const App = withRouter(connect(
   mapStateToProps,
   mapDispatchToProps
)(Main));

export default App;
