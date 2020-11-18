import createHistory from 'history/createBrowserHistory';

let history = createHistory({
  basename: process.env.PUBLIC_URL,
}); // eslint-disable-line
function resetHistory(props) {
  history = createHistory(props);
  return history;
}

export { history, resetHistory };
