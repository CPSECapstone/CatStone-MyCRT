import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import react router
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store from './store';

const router = (
   <Provider store={store}>
      <BrowserRouter>
         <App/>
      </BrowserRouter>
   </Provider>
)

ReactDOM.render(router, document.getElementById('root'));
registerServiceWorker();
