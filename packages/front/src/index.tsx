import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Provider } from 'hookux';

import { App } from './app';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
