import React from 'react';
import './styles/languageItem.less';
import { Button, Progress } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const LanguageItem = () => {
  const progressRender = (size: string) => {
    return (
      <div className={'language-progress'}>
        <div className={'language-progress-text'}>
          <p className={'language-progress-text-value'} style={{ fontSize: size === 'small' ? '24px' : '32px' }}>
            {'1,354'} <span>{' / 1,354 Keys'}</span>
          </p>
          <p className={'language-progress-text-status'}>{'Done 100%'}</p>
        </div>
        <Progress percent={100} showInfo={false} />
      </div>
    );
  };

  return (
    <>
      <div className={'language-item'}>
        <div className={'language-title'}>
          <p>
            {'English'}
            <span>{' (Reference Language)'}</span>
          </p>
          <div className={'language-iocn-list'}>
            <Button>
              <DeleteOutlined />
            </Button>
            <Button>
              <PlusOutlined />
            </Button>
          </div>
        </div>
        {progressRender('large')}
        <div className={'language-namespaces-progress'}>
          <div className={'language-namespaces-progress-item'}>
            <p className={'language-namespaces-progress-title'}>{'Namespaces-1'}</p>
            {progressRender('small')}
          </div>
          <div className={'language-namespaces-progress-item'}>
            <p className={'language-namespaces-progress-title'}>{'Namespaces-3'}</p>
            {progressRender('small')}
          </div>
          <div className={'language-namespaces-progress-item'}>
            <p className={'language-namespaces-progress-title'}>{'Namespaces-4'}</p>
            {progressRender('small')}
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageItem;
