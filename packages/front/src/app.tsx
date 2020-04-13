import * as React from 'react';
import { ajax } from '@ofm/ajax';

export function App() {
  React.useEffect(() => {
    const res = ajax.get('/hello');
    res.then(rr => {
      // eslint-disable-next-line no-console
      console.log(rr);
    });
  }, []);

  return <div>app</div>;
}
