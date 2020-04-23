import React from 'react';
import * as css from './styles/header.modules.less';
import { UserOutlined, ImportOutlined } from '@ant-design/icons';

const imgSrc = require('./header.png');

const Header = () => {
  return (
    <div className={css.header}>
      <div className={css.headerLeft}>
        <img src={imgSrc} />
        <p>{'Translation'}</p>
        <p>{'User Management'}</p>
      </div>
      <div className={css.headerRight}>
        <div className={css.headerToolItem}>
          <UserOutlined />
          <span>{'Admin123456'}</span>
        </div>
        <div className={css.headerToolItem}>
          <ImportOutlined />
          <span>{'Logout'}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
