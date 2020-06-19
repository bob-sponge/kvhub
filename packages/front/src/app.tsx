import * as React from 'react';
import { ajax } from '@ofm/ajax';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { history } from '@ofm/history';
import NamespaceView from './modules/namespace';
import Languages from './modules/languages';
import Dashboard from './modules/dashboard';
import Branches from './modules/branches';
import MergeRequest from './modules/mergeRequest';
import MergeDetail from './modules/mergeRequest/mergeDetail/main';
import Compare from './modules/branches/compare/compare';

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
      <Route exact path="/namespace/:namespaceId/:languageId" component={NamespaceView} />
      <Route exact path="/languages/:projectId" component={Languages} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/branch/:projectId" component={Branches} />
      <Route exact path="/mergeRequest/:projectId" component={MergeRequest} />
      <Route exact path="/mergeRequest/detail/:branchMergeId" component={MergeDetail} />
      <Route exact path="/branch/compare/:id" component={Compare} />
      <Redirect from={'/'} strict={true} to={'/dashboard'} />
    </Switch>
  </Router>
);
