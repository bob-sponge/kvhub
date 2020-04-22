import React from 'react';
import SideBar from '../siderBar';
import Header from '../header';
import './styles/languages.less';
import { Button } from 'antd';
import LanguageItem from './languageItem';

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
            <LanguageItem />
            <LanguageItem />
            <LanguageItem />
          </div>
        </div>
      </div>
    </>
  );
};

export default Languages;
