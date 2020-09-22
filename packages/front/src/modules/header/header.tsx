import React, { useState, useEffect } from 'react';
import * as css from './styles/header.modules.less';
import { UserOutlined, ImportOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { history as browserHistory } from '@ofm/history';

const imgSrc = require('./header.png');

const Header = () => {
  const [selectTab, setSelectTab] = useState<string>('translation');

  useEffect(() => {
    if (window.location.pathname === '/user') {
      setSelectTab('user');
    } else {
      setSelectTab('translation');
    }
  }, []);

  const handleClick = (e: any) => {
    setSelectTab(e.key);
    if (e.key === 'translation') {
      browserHistory.push('/dashobard');
    } else {
      browserHistory.push('/user');
    }
  };

  const getUserInfo = () => {
    browserHistory.push('/profile');
  };

  return (
    <div className={css.header}>
      <div className={css.headerLeft}>
        <img src={imgSrc} />
        <Menu onClick={handleClick} selectedKeys={[selectTab]} mode="horizontal">
          <Menu.Item key="translation">Translation</Menu.Item>
          <Menu.Item key="user">User Management</Menu.Item>
        </Menu>
      </div>
      <div className={css.headerRight}>
        <div className={css.headerToolItem} onClick={getUserInfo}>
          <UserOutlined />
          <span>Admin123456</span>
        </div>
        <div className={css.headerToolItem}>
          <ImportOutlined />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
