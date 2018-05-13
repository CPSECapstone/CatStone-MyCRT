import { createStore, applyMiddleware } from 'redux';
// import { syncHistoryWithStore} from 'react-router-redux';
import { createBrowserHistory } from 'history';
// import the root reducer
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import thunk from 'redux-thunk';

import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from './reducers/index';

const defaultState = {};

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel2
};

const pReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(pReducer, defaultState,
 composeWithDevTools(applyMiddleware(thunk)));

if (module.hot) {
   module.hot.accept('./reducers/',() => {
      const nextRootReducer = require('./reducers/index').default;
      store.replaceReducer(nextRootReducer);
   });
}

export const history = createBrowserHistory();
export const persistor = persistStore(store);