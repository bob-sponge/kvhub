import React, { useState, useEffect, useCallback } from 'react';
import SideBar from '../siderBar';
import Header from '../header';
import * as css from './styles/languages.modules.less';
import { Button, Select } from 'antd';
import LanguageItem from './languageItem';
import AddNewLanguage from './addNewLanguage';
import { projectViewApi, branchListApi } from '../../api/languages';

const Option = Select.Option;

const Languages = () => {
  const [visible, setVisible] = useState(false);
  const [languageList, setLanguageList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [branchId, setBranchId] = useState('');

  const getBranchList = useCallback(async () => {
    const res = await branchListApi('7');
    if (res.data) {
      setBranchList(res.data);
      setBranchId(res.data[0] && res.data[0].id);
      projectView(res.data[0] && res.data[0].id);
    }
  }, []);

  const projectView = useCallback(async (id: string) => {
    const res = await projectViewApi({
      pid: 7,
      id,
    });
    if (res.data) {
      setLanguageList(res.data.data);
    }
  }, []);

  useEffect(() => {
    getBranchList();
  }, [getBranchList]);

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
              <Select
                className={css.languageSelect}
                value={branchId}
                onChange={value => {
                  setBranchId(value);
                  projectView(value);
                }}>
                {branchList &&
                  branchList.map((item: any) => {
                    return (
                      <Option value={item.id} key={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
              </Select>
              <Button type="primary" onClick={showAdd}>
                {'Add Language'}
              </Button>
            </div>
          </div>
          <div className={css.languagesContent}>
            {languageList &&
              languageList.map((item: any, index) => {
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
