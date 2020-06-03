import React from 'react';
import * as css from '../styles/merge.modules.less';
import { Button } from 'antd';
import Container from '../../../container';
import DiffItem from './diffItem';

const Merge: React.SFC = () => {
  return (
    <Container>
      <div className={css.mergeWapper}>
        <div className={css.commonTitle}>
          <div className={css.title}>{'merge'}</div>
          <div className={css.buttonList}>
            <Button>{'Back'}</Button>
            <Button>{'Download'}</Button>
            <Button>{'Refused'}</Button>
            <Button>{'Submit Merge'}</Button>
          </div>
        </div>
        <div className={css.diffTitle}>
          {'Diff(3)'}
          <span>{'Please select the results you want to merge'}</span>
        </div>
        <DiffItem />
      </div>
    </Container>
  );
};

export default Merge;
