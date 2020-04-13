import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Provider } from 'hookux';
import { initAjax } from '@ofm/ajax';

import { App } from './app';

initAjax({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
});

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
