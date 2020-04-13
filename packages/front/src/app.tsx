import * as React from 'react';
import { ajax } from '@ofm/ajax';

export function App() {
  React.useEffect(() => {
    const res = ajax.get('/hello');
    // eslint-disable-next-line no-console
    console.log(res);
  }, []);

  return <div>app</div>;
}
