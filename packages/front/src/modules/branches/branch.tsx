import React, { useState, useEffect } from 'react';
import * as css from './style/index.modules.less';
import ContainerMenu from '../../containerMenu';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Table, Empty } from 'antd';
import { columns, dataSource } from './tableConfig';
import AddorEditBranch from './addOrEditBranch';
import { history } from '@ofm/history';
const { Search } = Input;

const Branches: React.SFC = () => {
  const [total] = useState(10);
  const [visible, setVisible] = useState<boolean>(false);
  const [branchList, setBranchList] = useState<any[]>([]);

  useEffect(() => {
    setBranchList(dataSource);
  }, []);

  const showTotal = () => {
    return `Total ${total} items`;
  };

  const onCompare = (record: any) => {
    window.console.log(record);
    history.push(`/branch/compare/${record.key}`);
  };

  const onDelete = (record: any) => {
    window.console.log(record);
  };

  return (
    <ContainerMenu>
      <div className={css.branchWapper}>
        <div className={css.basicTitle}>
          <div className={css.title}>Branches</div>
          <div className={css.operation}>
            <Search
              placeholder="Searchbox"
              onSearch={value => window.console.log(value)}
              style={{ width: 264, marginRight: 16 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
              Create Branch
            </Button>
          </div>
        </div>
        <div className={css.branchTable}>
          <Table
            columns={columns(onCompare, onDelete)}
            dataSource={branchList}
            pagination={{
              position: 'bottomRight',
              showSizeChanger: true,
              showTotal: showTotal,
            }}
          />
          {branchList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </div>
      </div>
      <AddorEditBranch visible={visible} setVisible={setVisible} />
    </ContainerMenu>
  );
};

export default Branches;
