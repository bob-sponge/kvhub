import React from 'react';
import SideBar from '../siderBar';
import Header from '../header';
import * as css from './styles/margeRequest.modules.less';
import { Button, Input, Table } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { columns } from './constant';

const MargeRequest = () => {
  return (
    <div>
      <Header />
      <div className={css.main}>
        <SideBar />
        <div className={css.margeRequest}>
          <div className={css.margeRequestTitle}>
            <p className={css.titleText}>{'Marge Request'}</p>
            <div className={css.titleLeft}>
              <Input className={css.margeRequestInput} placeholder={'Searchbox'} suffix={<SearchOutlined />} />
              <Button type="primary">
                <PlusOutlined />
                {'Create Marge Request'}
              </Button>
            </div>
          </div>
          <Table columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default MargeRequest;
