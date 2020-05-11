import React, { useState } from 'react';
import * as css from './style/index.modules.less';
import ContainerMenu from '../../containerMenu';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Table } from 'antd';
import { columns, dataSource } from './tableConfig';
const { Search } = Input;

const Branches: React.SFC = () => {
  const [total] = useState(10);

  const showTotal = () => {
    return `Total ${total} items`;
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
            <Button type="primary" icon={<PlusOutlined />}>
              Create Branch
            </Button>
          </div>
        </div>
        <div className={css.branchTable}>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              position: 'bottomRight',
              showSizeChanger: true,
              showTotal: showTotal,
            }}
          />
          ,
        </div>
      </div>
    </ContainerMenu>
  );
};

export default Branches;
