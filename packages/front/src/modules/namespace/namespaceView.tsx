import React, { useCallback, useEffect, useState } from 'react';
import LanguageBox from './box';
import Container from '../../container';
import * as Api from '../../api/namespace';
import EditKeyDrawer from './editKeyDrawer';
import * as css from './styles/namespace.modules.less';
import { ItemKey, ADD, LanguageItem, ConditionReq, DELETE } from './constant';
import { Button, Select, Radio, Input, Pagination, Spin, message } from 'antd';
import { DeleteFilled, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

const NamespaceView: React.FC = () => {
  const paths = window.location.pathname.split('/');
  const name = paths[2];
  const projectId = parseInt(paths[3]);
  const namespaceId = parseInt(paths[4]);
  const languageId = parseInt(paths[5]);

  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [keys, setKeys] = useState<Array<any>>([]);
  const [languages, setLanguages] = useState<Array<any>>([]);
  const [branches, setBranches] = useState<Array<any>>([]);
  const [mode, setMode] = useState<string>(ADD);
  const [keyItem, setKeyItem] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<ConditionReq>({
    namespaceId: namespaceId,
    referenceLanguageId: languageId,
    targetLanguageId: 0,
    KeyTranslateProgressStatus: 'all',
    page: 1,
    pageSize: 10,
    condition: '',
    branchId: 7,
  });

  const getList = useCallback(async filterData => {
    setLoading(true);
    const keyRes = await Api.getKeys(filterData);
    if (keyRes.success) {
      setLoading(false);
      setKeys(keyRes.data.keys);
      setTotal(keyRes.data.totalNum);
    }
  }, []);

  const fetchData = useCallback(async () => {
    const languagesRes = await Api.getLanguages(namespaceId);
    const branchesRes = await Api.branchList(projectId);

    if (languagesRes.data && languagesRes.data.length > 0) {
      filter.targetLanguageId = languagesRes.data[0].id;
    }
    if (branchesRes.data && branchesRes.data.length > 0) {
      filter.branchId = branchesRes.data[0].id;
    }
    setLanguages(languagesRes.data || []);
    setBranches(branchesRes.data || []);
    setFilter(filter);
    getList(filter);
  }, [filter]);

  const handleConditionChange = useCallback(
    async e => {
      filter.condition = e.target.value;
      setFilter(filter);
      getList(filter);
    },
    [filter],
  );

  const handleRadioChange = useCallback(
    async e => {
      filter.KeyTranslateProgressStatus = e.target.value;
      setFilter(filter);
      getList(filter);
    },
    [filter],
  );

  const handleLangChange = useCallback(
    async value => {
      filter.targetLanguageId = value;
      setFilter(filter);
      getList(filter);
    },
    [filter],
  );

  const handleBranchChange = useCallback(
    async value => {
      filter.branchId = value;
      setFilter(filter);
      getList(filter);
    },
    [filter],
  );

  const onShowSizeChange = useCallback(
    (current, pageSize) => {
      filter.page = current === 0 ? 1 : current;
      filter.pageSize = pageSize;
      getList(filter);
    },
    [filter],
  );

  const onPageChange = useCallback(
    (current, pageSize) => {
      filter.page = current;
      filter.pageSize = pageSize;
      getList(filter);
    },
    [filter],
  );

  const handleRefreshList = useCallback(() => {
    getList(filter);
  }, [filter]);

  const addKey = useCallback(() => {
    setMode(ADD);
    setShowDrawer(true);
  }, []);

  const editKeyValue = useCallback(async (flag: string, value: any, item: any) => {
    setShowDrawer(value);
    setMode(flag);
    setKeyItem(item);
    if (flag === DELETE) {
      await Api.deleteKey(item.keyId);
      handleRefreshList();
    }
  }, []);

  const deletNamespace = useCallback(async () => {
    await Api.deleteNamespace(namespaceId);
    window.history.go(-1);
    message.success('Namespace delete successfully!');
  }, [namespaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Spin spinning={loading}>
      <Container>
        <div className={css.title}>
          <div>
            <span>{name}</span>
          </div>
          <div>
            {branches.length > 0 && (
              <Select defaultValue={branches[0].id} style={{ width: '129px' }} onChange={handleBranchChange}>
                {branches.map((item: any, index: number) => (
                  <Option key={index} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
            <Button onClick={deletNamespace} className={css.operationBtn} icon={<DeleteFilled />}>
              Delete Namespace
            </Button>
            <Button onClick={() => window.history.go(-1)} className={css.operationBtn} icon={<ArrowLeftOutlined />}>
              Back
            </Button>
            <Button className={css.operationBtn} onClick={addKey} icon={<PlusOutlined />}>
              Add Key
            </Button>
          </div>
        </div>
        <div className={css.title}>
          <div>
            {languages.length > 0 && (
              <Select defaultValue={languages[0].id} style={{ width: '270px' }} onChange={handleLangChange}>
                {languages.map((lang: LanguageItem, index: number) => (
                  <Option key={index} value={lang.id}>
                    {lang.referenceLanguage ? lang.name + ' (Reference Language) ' : lang.name}
                  </Option>
                ))}
              </Select>
            )}
          </div>
          <div>
            <Radio.Group defaultValue={'all'} onChange={handleRadioChange}>
              <Radio className={css.searchType} value={'all'}>
                All
              </Radio>
              <Radio className={css.searchType} value={'unfinished'}>
                Unfinished
              </Radio>
              <Radio className={css.searchType} value={'finished'}>
                Finished
              </Radio>
            </Radio.Group>
            <Search placeholder="Please input key" style={{ width: 200 }} onChange={handleConditionChange} />
          </div>
        </div>
        <div className={css.namespace}>
          {keys.length > 0 &&
            keys.map((item: ItemKey, index: number) => {
              const referLang = languages.find(t => t.id === item.refreLanguageValue.languageId);
              const targetLang = languages.find(t => t.id === item.targetLanguageValue.languageId);
              Object.assign(item.refreLanguageValue, { languageName: referLang ? referLang.name : '' });
              Object.assign(item.targetLanguageValue, { languageName: targetLang ? targetLang.name : '' });
              return (
                <LanguageBox
                  branchId={filter.branchId}
                  key={index}
                  keyData={item}
                  refreshList={handleRefreshList}
                  setShowDrawer={editKeyValue}
                />
              );
            })}
        </div>
        <div className={css.pagenation}>
          <Pagination
            showSizeChanger
            onChange={onPageChange}
            onShowSizeChange={onShowSizeChange}
            defaultCurrent={1}
            total={total}
          />
        </div>
        {showDrawer && (
          <EditKeyDrawer
            keyItem={keyItem}
            mode={mode}
            branchId={filter.branchId}
            namespaceId={namespaceId}
            visible={showDrawer}
            languages={languages}
            refreshList={handleRefreshList}
            onClose={() => {
              setShowDrawer(false);
              handleRefreshList();
            }}
          />
        )}
      </Container>
    </Spin>
  );
};

export default NamespaceView;
