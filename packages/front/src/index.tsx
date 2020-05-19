import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Provider } from 'hookux';
import { initAjax } from '@ofm/ajax';
import './style/main.less';

import './config';

import { App } from './app';

if (process.env.NODE_ENV === 'development') {
  initAjax({
    baseURL: `http://${process.conf.ip}`,
    withCredentials: true,
  });
} else {
  initAjax({
    baseURL: '',
    withCredentials: true,
  });
}

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
