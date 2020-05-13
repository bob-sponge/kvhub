import React from 'react';
import * as css from '../style/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';

const DiffItem = () => {
  return (
    <div className={css.diffItem}>
      <div className={css.itemList}>
        <div className={css.title}>
          <KeyOutlined />
          <span>ACTIVITY_LINE_NOT_EXITS</span>
        </div>
        <div className={css.keyList}>
          <div className={css.language}>EN</div>
          <div className={css.name}>Open Industrial Business Monitoring for You</div>
        </div>
        <div className={css.keyList}>
          <div className={css.language}>EN</div>
          <div className={css.name}>Open Industrial Business Monitoring for You</div>
        </div>
        <div className={css.keyList}>
          <div className={css.language}>EN</div>
          <div className={css.name}>Open Industrial Business Monitoring for You</div>
        </div>
      </div>
      <div className={css.itemList}>
        <div className={css.title}>
          <KeyOutlined />
          <span>ACTIVITY_LINE_NOT_EXITS</span>
        </div>
        <div className={css.keyList}>
          <div className={css.language}>EN</div>
          <div className={css.name}>Open Industrial Business Monitoring for You</div>
        </div>
        <div className={css.keyList}>
          <div className={css.language}>EN</div>
          <div className={css.name}>Open Industrial Business Monitoring for You</div>
        </div>
        <div className={css.keyList}>
          <div className={css.language}>EN</div>
          <div className={css.name}>Open Industrial Business Monitoring for You</div>
        </div>
      </div>
    </div>
  );
};

export default DiffItem;
