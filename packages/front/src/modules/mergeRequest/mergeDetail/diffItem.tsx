import React from 'react';
import * as css from '../styles/merge.modules.less';
import { Button } from 'antd';
import { KeyOutlined, EditOutlined } from '@ant-design/icons';

const DiffItem = () => {
  return (
    <div className={css.diffItem}>
      <div className={css.itemList}>
        <div className={css.title}>
          <div className={css.titleContent}>
            <KeyOutlined />
            <span>ACTIVITY_LINE_NOT_EXITS</span>
          </div>
          <Button>
            <EditOutlined />
          </Button>
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
        <Button>{'Select'}</Button>
      </div>
      <div className={css.itemList}>
        <div className={css.title}>
          <div className={css.titleContent}>
            <KeyOutlined />
            <span>ACTIVITY_LINE_NOT_EXITS</span>
          </div>
          <Button>
            <EditOutlined />
          </Button>
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
        <Button>{'Select'}</Button>
      </div>
    </div>
  );
};

export default DiffItem;
