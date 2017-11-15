import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Header from './components/header/Header.js';
import NavPage from './components/Pages/NavPage.js';
import NavBar from './components/header/NavBar.js';

class App extends Component {
  render() {
    return (
      <div class="App">
        <Header/>
        <div class="app-content">
          <NavBar/>
          <NavPage/>
        </div>
      </div>
    );
  }
}

export default App;
