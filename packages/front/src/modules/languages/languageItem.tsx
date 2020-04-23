import React from 'react';
import * as css from './styles/languageItem.modules.less';
import { Button, Progress, Popover } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const LanguageItem = () => {
  const progressRender = (size: string) => {
    return (
      <div className={css.languageProgress}>
        <div className={css.languageProgressText}>
          <p className={css.languageProgressTextValue} style={{ fontSize: size === 'small' ? '24px' : '32px' }}>
            {'1,354'} <span>{' / 1,354 Keys'}</span>
          </p>
          <p className={css.languageProgressTextStatus}>{'Done 100%'}</p>
        </div>
        <Progress percent={100} showInfo={false} />
      </div>
    );
  };

  const content = (
    <div>
      <p>Content</p>
    </div>
  );

  return (
    <>
      <div className={css.languageItem}>
        <div className={css.languageTitle}>
          <p>
            {'English'}
            <span>{' (Reference Language)'}</span>
          </p>
          <div className={css.languageIocnList}>
            <Popover content={content} trigger="click" placement="bottomRight">
              <Button>
                <DeleteOutlined />
              </Button>
            </Popover>
            <Popover content={content} trigger="click" placement="bottomRight">
              <Button>
                <PlusOutlined />
              </Button>
            </Popover>
          </div>
        </div>
        {progressRender('large')}
        <div className={css.languageNamespacesProgress}>
          <div className={css.languageNamespacesProgressItem}>
            <p className={css.languageNamespacesProgressTitle}>{'Namespaces-1'}</p>
            {progressRender('small')}
          </div>
          <div className={css.languageNamespacesProgressItem}>
            <p className={css.languageNamespacesProgressTitle}>{'Namespaces-3'}</p>
            {progressRender('small')}
          </div>
          <div className={css.languageNamespacesProgressItem}>
            <p className={css.languageNamespacesProgressTitle}>{'Namespaces-4'}</p>
            {progressRender('small')}
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageItem;
