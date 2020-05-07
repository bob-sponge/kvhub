import React, { useCallback, useEffect, useState } from 'react';
import LanguageBox from './box';
import { ajax } from '@ofm/ajax';
import * as css from './styles/namespace.modules.less';
import { Button, Select, Radio, Input, Pagination } from 'antd';
import { ItemKey, LanguageItem, ConditionReq } from './constant';
import { DeleteFilled, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

<<<<<<< HEAD
const NamespaceView: React.FC = () => {
  const createLanguageBox = () => {
    const boxes = [];
    for (let i = 0; i < 10; i++) {
      boxes.push(<LanguageBox />);
    }
    return boxes;
  };
=======
const PREFIX_URL = 'http://localhost:5000';

const NamespaceView: React.FC = () => {
  const [keys, setKeys] = useState<Array<any>>([]);
  const [languages, setLanguages] = useState<Array<any>>([]);
  const [filter, setFilter] = useState<ConditionReq>({
    namespaceId: 1,
    referenceLanguageId: 1,
    targetLanguageId: 2,
    KeyTranslateProgressStatus: 'all',
    page: 1,
    pageSize: 10,
    condition: '',
  });
>>>>>>> a0344e1add35789224787552c30eaae4b0897238

  const onShowSizeChange = useCallback((current, pageSize) => {
    window.console.log(current, pageSize);
  }, []);

  const fetchData = useCallback(async () => {
    const namespaceId = 1;
    const languagesRes = await ajax.get(`${PREFIX_URL}/namespace/view/${namespaceId}/languages`);
    setLanguages(languagesRes.data.data);
    const keyRes = await ajax.post(`${PREFIX_URL}/namespace/view/keys`, filter);
    setKeys(keyRes.data.data.keys);
  }, []);

  const handleConditionChange = useCallback(
    async e => {
      filter.condition = e.target.value;
      const keyRes = await ajax.post(`${PREFIX_URL}/namespace/view/keys`, filter);
      setFilter(filter);
      setKeys(keyRes.data.data.keys);
    },
    [filter],
  );

  const handleRadioChange = useCallback(
    async e => {
      filter.KeyTranslateProgressStatus = e.target.value;
      const keyRes = await ajax.post(`${PREFIX_URL}/namespace/view/keys`, filter);
      setFilter(filter);
      setKeys(keyRes.data.data.keys);
    },
    [filter],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
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
            <Select defaultValue={languages[0].id} style={{ width: '129px' }}>
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
            Object.assign(item.refreLanguageValue, { languageName: referLang.name });
            Object.assign(item.targetLanguageValue, { languageName: targetLang.name });
            return <LanguageBox key={index} keyData={item} />;
          })}
      </div>
      <div className={css.pagenation}>
        <Pagination showSizeChanger onShowSizeChange={onShowSizeChange} defaultCurrent={1} total={keys.length} />
      </div>
    </>
  );
};

export default NamespaceView;
