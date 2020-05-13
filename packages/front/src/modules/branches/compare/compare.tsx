import React from 'react';
import * as css from '../style/compare.modules.less';
import Container from '../../../container';
import CompareObject from './compareProject';
import DiffItem from './diffItem';

const Compare: React.SFC = () => {
  return (
    <Container>
      <div className={css.compareWapper}>
        <div className={css.commonTitle}>Compare</div>
        <CompareObject />
        <div className={css.diffTitle}>Diff (3)</div>
        {/* <div className={diffPanel}></div> */}
        <DiffItem />
      </div>
    </Container>
  );
};

export default Compare;
