import * as React from 'react';
import { ajax } from '@ofm/ajax';
import { Router, Route, Switch } from 'react-router-dom';
import { history } from '@ofm/history';
import NamespaceView from './modules/namespace';
import Languages from './modules/languages';
import Dashboard from './modules/dashboard';
<<<<<<< HEAD
import Branches from './modules/branches';
=======
import MargeRequest from './modules/margeRequest';
>>>>>>> 4561a4e0eefbe1d04085a4035da5285862730ef4

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
<<<<<<< HEAD
      <Route exact path="/branches" component={Branches} />
=======
      <Route exact path="/margeRequest" component={MargeRequest} />
>>>>>>> 4561a4e0eefbe1d04085a4035da5285862730ef4
    </Switch>
  </Router>
);
