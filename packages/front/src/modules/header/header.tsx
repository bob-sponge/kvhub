import React from 'react';
import './header.less';
import { UserOutlined, ImportOutlined } from '@ant-design/icons';

const imgSrc = require('./header.png');

const Header = () => {
  return (
    <div className={'header'}>
      <div className={'header-left'}>
        <img src={imgSrc} />
        <p>{'Translation'}</p>
        <p>{'User Management'}</p>
      </div>
      <div className={'header-right'}>
        <div className={'header-tool-item'}>
          <UserOutlined />
          <span>{'Admin123456'}</span>
        </div>
        <div className={'header-tool-item'}>
          <ImportOutlined />
          <span>{'Logout'}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
