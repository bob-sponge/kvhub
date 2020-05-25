import React, { useState, useEffect, useCallback } from 'react';
import SideBar from '../siderBar';
import Header from '../header';
import * as css from './styles/languages.modules.less';
import { Button, Select } from 'antd';
import LanguageItem from './languageItem';
import AddNewLanguage from './addNewLanguage';
import { mockLanguageList } from './mock';
import { projectViewApi } from '../../api/languages';

const Option = Select.Option;

const Languages = () => {
  const [visible, setVisible] = useState(false);
  const [languageList, setLanguageList] = useState(mockLanguageList);

  const projectView = useCallback(async () => {
    window.console.log(languageList);
    const res = await projectViewApi({
      pid: 7,
      id: 2,
    });
    if (res.data && res.data.isSuccess) {
      setLanguageList(res.data);
    }
  }, []);

  useEffect(() => {
    projectView();
  }, [projectView]);

  const showAdd = () => {
    setVisible(!visible);
  };

  return (
    <div>
      <Header />
      <div className={css.main}>
        <SideBar />
        <div className={css.languages}>
          <div className={css.languagesTitle}>
            <p className={css.titleText}>{'Languages'}</p>
            <div className={css.titleLeft}>
              <Select className={css.languageSelect} defaultValue={1}>
                <Option value={1}>{'分支1'}</Option>
                <Option value={1}>{'分支2'}</Option>
              </Select>
              <Button type="primary" onClick={showAdd}>
                {'Add Language'}
              </Button>
            </div>
          </div>
          <div className={css.languagesContent}>
            {languageList.map((item, index) => {
              return <LanguageItem item={item} index={index} key={item.id} />;
            })}
          </div>
        </div>
      </div>
      {visible && <AddNewLanguage visible={visible} showAdd={showAdd} />}
    </div>
  );
};

export default Languages;
