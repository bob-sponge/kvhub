import * as React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { history } from '@ofm/history';
import NamespaceView from './modules/namespace';
import Languages from './modules/languages';
import Dashboard from './modules/dashboard';
import Branches from './modules/branches';
import MergeRequest from './modules/mergeRequest';
import MergeDetail from './modules/mergeRequest/mergeDetail/main';
import Compare from './modules/branches/compare/compare';
import Login from './login';
import User from './modules/user';
import Profile from './modules/profile';

export function App() {
  return (
    <div>
      <BasicRoute />
    </div>
  );
}

const BasicRoute = () => (
  <Router history={history}>
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route exact path="/user" component={User} />
      <Route exact path="/profile" component={Profile} />
      <Route exact path="/" component={Login} />
      <Route exact path="/namespace/:name/:projectId/:namespaceId/:languageId" component={NamespaceView} />
      <Route exact path="/languages/:projectId" component={Languages} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/branch/:projectId" component={Branches} />
      <Route exact path="/mergeRequest/:projectId" component={MergeRequest} />
      <Route exact path="/mergeRequest/detail/:branchMergeId" component={MergeDetail} />
      <Route exact path="/branch/compare/:id" component={Compare} />
      <Redirect from={'/'} to={'/dashboard'} />
    </Switch>
  </Router>
);
