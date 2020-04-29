import * as React from 'react';
import { ajax } from '@ofm/ajax';
import { Router, Route, Switch } from 'react-router-dom';
import { history } from '@ofm/history';
import NamespaceView from './modules/namespace';
import Languages from './modules/languages';
import Dashboard from './modules/dashboard';

export function App() {
  React.useEffect(() => {
    const res = ajax.get('/hello');
    res.then(rr => {
      // eslint-disable-next-line no-console
      console.log(rr);
    });
  }, []);

  return (
    <div>
      <BasicRoute />
    </div>
  );
}

const BasicRoute = () => (
  <Router history={history}>
    <Switch>
      <Route exact path="/namespace" component={NamespaceView} />
      <Route exact path="/languages" component={Languages} />
      <Route exact path="/dashboard" component={Dashboard} />
    </Switch>
  </Router>
);
