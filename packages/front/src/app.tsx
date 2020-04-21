import * as React from 'react';
import { ajax } from '@ofm/ajax';
import { HashRouter, Route, Switch } from 'react-router-dom';
import EditNamespace from './namespace/namespaceView';
import Languages from './modules/languages';

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
      <Route exact path="/namespace" component={EditNamespace} />
      <Route exact path="/languages" component={Languages} />
    </Switch>
  </HashRouter>
);
