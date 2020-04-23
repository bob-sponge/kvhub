import * as React from 'react';
import { ajax } from '@ofm/ajax';
import { HashRouter, Route, Switch } from 'react-router-dom';
import NamespaceView from './namespace';
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
  <HashRouter>
    <Switch>
      <Route exact path="/namespace" component={NamespaceView} />
      <Route exact path="/languages" component={Languages} />
      <Route exact path="/dashboard" component={Dashboard} />
    </Switch>
  </HashRouter>
);
