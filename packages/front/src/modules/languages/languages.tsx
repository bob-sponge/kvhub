import React from 'react';
import { Header, SideBar } from '../siderBar';
import './languages.less';
import { Button, Progress } from 'antd';

// const Option = Select.Option;

const Languages = () => {
  return (
    <>
      <Header />
      <div className={'i18n-main'}>
        <SideBar />
        <div className={'languages'}>
          <div className={'languages-title'}>
            <div className={'title-left'}>
              <p>{'Languages'}</p>
              {/* <Select className={'language-select'} value={1}>
                <Option value={1}>{'分支1'}</Option>
                <Option value={1}>{'分支2'}</Option>
              </Select> */}
            </div>
            <Button type="primary">{'Add Language'}</Button>
          </div>
          <div className={'languages-content'}>
            <div className={'content-item'}>
              <p>{'English'}</p>
              <h4>
                {'1354 '}
                <span>{'/ 1354'}</span>
              </h4>
              <Progress percent={100} />
              <div className={'language-namespaces-item'}>
                <p>{'Namespaces-1'}</p>
                <h4>
                  {'673 '}
                  <span>{'/ 673'}</span>
                </h4>
                <Progress percent={100} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Languages;
