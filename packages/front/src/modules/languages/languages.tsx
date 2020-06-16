import React, { useState, useEffect, useCallback } from 'react';
import ContainerMenu from '../../containerMenu';
import * as css from './styles/languages.modules.less';
import { Button, Select } from 'antd';
import LanguageItem from './languageItem';
import AddNewLanguage from './addNewLanguage';
import { projectViewApi, branchListApi, projectLanguageSaveApi } from '../../api/languages';

const Option = Select.Option;

interface LanguagesProps {
  match: any;
}

const Languages = (props: LanguagesProps) => {
  const { match } = props;
  const [visible, setVisible] = useState(false);
  const [languageList, setLanguageList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [branchId, setBranchId] = useState('');

  const getBranchList = useCallback(async () => {
    const projectId = match.params.projectId;
    const res = await branchListApi(projectId);
    if (res.data) {
      setBranchList(res.data);
      setBranchId(res.data[0] && res.data[0].id);
      projectView(res.data[0] && res.data[0].id);
    }
  }, []);

  const projectView = useCallback(async (id: string) => {
    const projectId = match.params.projectId;
    const res = await projectViewApi({
      pid: projectId,
      id,
    });
    if (res.data) {
      setLanguageList(res.data);
    }
  }, []);

  useEffect(() => {
    getBranchList();
  }, [getBranchList]);

  const changeModal = async (detail?: any) => {
    window.console.log(detail);
    setVisible(!visible);
    if (detail) {
      const projectId = match.params.projectId;
      const content = Object.assign({}, detail, {
        id: branchId,
        projectId,
      });
      await projectLanguageSaveApi(content);
      projectView(branchId);
    }
  };

  return (
    <ContainerMenu>
      <div className={css.main}>
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
              <Button type="primary" onClick={changeModal}>
                {'Add Language'}
              </Button>
            </div>
          </div>
          <div className={css.languagesContent}>
            {languageList &&
              languageList.map((item: any, index) => {
                return <LanguageItem item={item} index={index} key={item.id} projectView={projectView} />;
              })}
          </div>
        </div>
      </div>
      {visible && <AddNewLanguage visible={visible} changeModal={changeModal} />}
    </ContainerMenu>
  );
};

export default Languages;
