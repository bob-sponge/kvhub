import React from 'react';
import * as css from '../style/compare.modules.less';
import Container from '../../../container';
import CompareObject from './compareProject';

interface CompareProps {
  match: any;
}

const Compare: React.SFC<CompareProps> = (props: CompareProps) => {
  const {
    match: {
      params: { id },
    },
  } = props;
  return (
    <Container>
      <div className={css.compareWapper}>
        <div className={css.commonTitle}>Compare</div>
        <CompareObject id={id} />
      </div>
    </Container>
  );
};

export default Compare;
