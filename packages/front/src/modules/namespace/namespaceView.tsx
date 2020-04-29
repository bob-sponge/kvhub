import React, { useCallback } from 'react';
import LanguageBox from './box';
import * as css from './styles/namespace.modules.less';
import { Button, Select, Radio, Input, Pagination } from 'antd';
import { DeleteFilled, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

const createLanguageBox = () => {
  const boxes = [];
  for (let i = 0; i < 10; i++) {
    boxes.push(<LanguageBox />);
  }
  return boxes;
};

const NamespaceView: React.FC = () => {
  const onShowSizeChange = useCallback((current, pageSize) => {
    window.console.log(current, pageSize);
  }, []);

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
          <Select defaultValue="lucy" style={{ width: '129px' }}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="Yiminghe">yiminghe</Option>
          </Select>
        </div>
        <div>
          <Radio.Group>
            <Radio className={css.searchType} value={1}>
              All
            </Radio>
            <Radio className={css.searchType} value={2}>
              Unfinished
            </Radio>
            <Radio className={css.searchType} value={3}>
              Finished
            </Radio>
          </Radio.Group>
          <Search placeholder="Please input key or value" style={{ width: 200 }} />
        </div>
      </div>
      <div className={css.namespace}>{createLanguageBox()}</div>
      <div className={css.pagenation}>
        <Pagination showSizeChanger onShowSizeChange={onShowSizeChange} defaultCurrent={3} total={500} />
      </div>
    </>
  );
};

export default NamespaceView;
