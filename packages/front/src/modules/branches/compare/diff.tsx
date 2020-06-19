import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';

interface DiffProps {
  orignal: string;
  target: string;
}

const Diff: React.SFC<DiffProps> = (props: DiffProps) => {
  const { orignal, target } = props;
  const newStyles = {
    variables: {
      light: {
        highlightBackground: '#fefed5',
      },
    },
    diffRemoved: {
      display: 'none',
    },
    diffAdded: {
      background: '#fff',
    },
    marker: {
      display: 'none',
    },
    contentText: {
      display: 'flex',
    },
    wordAdded: {
      background: 'transparent',
      color: '#43BDE0',
      padding: '0',
    },
    wordDiff: {
      padding: '0',
      fontFamily: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,Noto Sans, 
        sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`,
    },
  };
  return (
    <ReactDiffViewer oldValue={orignal} newValue={target} splitView={true} hideLineNumbers={true} styles={newStyles} />
  );
};

export default Diff;
