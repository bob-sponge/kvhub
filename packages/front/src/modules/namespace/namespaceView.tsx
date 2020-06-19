import React, { useCallback, useEffect, useState } from 'react';
import LanguageBox from './box';
import Container from '../../container';
import * as Api from '../../api/namespace';
import * as css from './styles/namespace.modules.less';
import { Button, Select, Radio, Input, Pagination } from 'antd';
import { ItemKey, LanguageItem, ConditionReq } from './constant';
import { DeleteFilled, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

const NamespaceView: React.FC = () => {
  const paths = window.location.pathname.split('/');
  const namespaceId = parseInt(paths[2]);
  const languageId = parseInt(paths[3]);
  const [keys, setKeys] = useState<Array<any>>([]);
  const [languages, setLanguages] = useState<Array<any>>([]);
  const [filter, setFilter] = useState<ConditionReq>({
    namespaceId: namespaceId,
    referenceLanguageId: languageId,
    targetLanguageId: 0,
    KeyTranslateProgressStatus: 'all',
    page: 1,
    pageSize: 10,
    condition: '',
  });

  const onShowSizeChange = useCallback((current, pageSize) => {
    window.console.log(current, pageSize);
  }, []);

  const getList = useCallback(async filterData => {
    const keyRes = await Api.getKeys(filterData);
    setKeys(keyRes.data.keys);
  }, []);

  const fetchData = useCallback(async () => {
    const languagesRes = await Api.getLanguages(namespaceId);
    setLanguages(languagesRes.data);
    if (languagesRes.data && languagesRes.data.length > 0) {
      filter.targetLanguageId = languagesRes.data[0].id;
    }
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

  const handleLangChange = useCallback(async value => {
    filter.targetLanguageId = value;
    const keyRes = await Api.getKeys(filter);
    setFilter(filter);
    setKeys(keyRes.data.keys);
  }, []);

  const handleRefreshList = useCallback(() => {
    getList(filter);
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container>
      <div className={css.title}>
        <div>
          <span>Namespace-1</span>
        </div>
        <div>
          <Button className={css.operationBtn} icon={<DeleteFilled />}>
            Delete Namespace
          </Button>
          <Button className={css.operationBtn} icon={<ArrowLeftOutlined />}>
            Back
          </Button>
          <Button className={css.operationBtn} icon={<PlusOutlined />}>
            Add Key
          </Button>
        </div>
      </div>
      <div className={css.title}>
        <div>
          {languages.length > 0 && (
            <Select defaultValue={languages[0].id} style={{ width: '129px' }} onChange={handleLangChange}>
              {languages.map((lang: LanguageItem, index: number) => (
                <Option key={index} value={lang.id}>
                  {lang.name}
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
            return <LanguageBox key={index} keyData={item} refreshList={handleRefreshList} />;
          })}
      </div>
      <div className={css.pagenation}>
        <Pagination showSizeChanger onShowSizeChange={onShowSizeChange} defaultCurrent={1} total={keys.length} />
      </div>
    </Container>
  );
};

export default NamespaceView;
