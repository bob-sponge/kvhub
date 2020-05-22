import React from 'react';
import * as css from '../style/compare.modules.less';
import Container from '../../../container';
import CompareObject from './compareProject';

const Compare: React.SFC = () => {
  return (
    <Container>
      <div className={css.compareWapper}>
        <div className={css.commonTitle}>Compare</div>
        <CompareObject />
      </div>
    </Container>
  );
};

export default Compare;
