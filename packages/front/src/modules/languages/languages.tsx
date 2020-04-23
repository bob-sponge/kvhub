import React from 'react';
import SideBar from '../siderBar';
import Header from '../header';
import * as css from './styles/languages.modules.less';
import { Button, Select } from 'antd';
import LanguageItem from './languageItem';

const Option = Select.Option;

const Languages = () => {
  return (
    <div>
      <Header />
      <div className={css.main}>
        <SideBar />
        <div className={css.languages}>
          <div className={css.languagesTitle}>
            <p>{'Languages'}</p>
            <div className={css.titleLeft}>
              <Select className={css.languageSelect} defaultValue={1}>
                <Option value={1}>{'分支1'}</Option>
                <Option value={1}>{'分支2'}</Option>
              </Select>
              <Button type="primary">{'Add Language'}</Button>
            </div>
          </div>
          <div className={css.languagesContent}>
            <LanguageItem />
            <LanguageItem />
            <LanguageItem />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Languages;
