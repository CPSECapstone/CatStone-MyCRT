import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/lib/integration/react';
 
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { persistor, store } from './store';

const router = (
   <Provider store={store}>
      <PersistGate loading={<p>Loading</p>} persistor={persistor}>
      <BrowserRouter>
         <App/>
      </BrowserRouter>
      </PersistGate>
   </Provider>
)

ReactDOM.render(router, document.getElementById('root'));
registerServiceWorker();
