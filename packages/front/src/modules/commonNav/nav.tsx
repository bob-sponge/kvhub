import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const Nav: React.SFC = () => {
  return (
    <Breadcrumb style={{ margin: '16px 24px' }}>
      <Breadcrumb.Item href="">
        <HomeOutlined />
        <span>Home</span>
      </Breadcrumb.Item>
      <Breadcrumb.Item href="">
        <span>Application List</span>
      </Breadcrumb.Item>
      <Breadcrumb.Item>Application</Breadcrumb.Item>
    </Breadcrumb>
  );
};

export default Nav;
