import React, { useState, useEffect, useCallback } from 'react';
import ContainerMenu from '../../containerMenu';
import * as css from './styles/languages.modules.less';
import { Button, Select, message } from 'antd';
import LanguageItem from './languageItem';
import AddNewLanguage from './addNewLanguage';
import * as Api from '../../api/languages';

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
    const res = await Api.branchListApi(projectId);
    if (res.data) {
      setBranchList(res.data);
      setBranchId(res.data[0] && res.data[0].id);
      projectView(res.data[0] && res.data[0].id);
    }
  }, []);

  const projectView = useCallback(async (id: string) => {
    const projectId = match.params.projectId;
    const res = await Api.projectViewApi({
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
    setVisible(!visible);
    if (detail) {
      const projectId = match.params.projectId;
      const content = Object.assign({}, detail, {
        // id: branchId,
        projectId: parseInt(projectId),
      });
      const res = await Api.projectLanguageSaveApi(content);
      projectView(branchId);
      message.success(res && res.data);
    }
  };

  return (
    <ContainerMenu match={match}>
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
              <Button type="primary" onClick={() => changeModal()}>
                {'Add Language'}
              </Button>
            </div>
          </div>
          <div className={css.languagesContent}>
            {languageList &&
              languageList.map((item: any, index) => {
                return (
                  <LanguageItem
                    pid={match.params.projectId}
                    branchId={branchId}
                    item={item}
                    index={index}
                    key={item.id}
                    projectView={projectView}
                  />
                );
              })}
          </div>
        </div>
      </div>
      <AddNewLanguage visible={visible} changeModal={changeModal} />
    </ContainerMenu>
  );
};

export default Languages;
