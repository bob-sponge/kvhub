import React, { useState, useEffect } from 'react';
import * as css from './styles/header.modules.less';
import { UserOutlined, ImportOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { history } from '../../history';
import * as Api from '../../api/login';

const imgSrc = require('./header.png');

const Header = () => {
  const [selectTab, setSelectTab] = useState<string>('translation');

  useEffect(() => {
    let isUrl;
    if (process.env.NODE_ENV === 'production') {
      isUrl = window.location.pathname === '/kvhub/user' || window.location.pathname === '/kvhub/profile';
    } else {
      isUrl = window.location.pathname === '/user' || window.location.pathname === '/profile';
    }
    if (isUrl) {
      setSelectTab('user');
    } else {
      setSelectTab('translation');
    }
  }, []);

  const handleClick = (e: any) => {
    setSelectTab(e.key);
    if (e.key === 'translation') {
      history.push('/dashboard');
    } else {
      history.push('/user');
    }
  };

  const getUser = () => {
    history.push('/profile');
  };

  const handleLogOut = async () => {
    const result = await Api.logoutApi();
    if (result.success) {
      localStorage.clear();
      history.push('/login');
    }
  };

  return (
    <div className={css.header}>
      <div className={css.headerLeft}>
        <img src={imgSrc} />
        <Menu onClick={handleClick} selectedKeys={[selectTab]} mode="horizontal">
          <Menu.Item key="translation">Translation</Menu.Item>
          {localStorage.getItem('userType') === '0' && <Menu.Item key="user">User Management</Menu.Item>}
        </Menu>
      </div>
      <div className={css.headerRight}>
        <div className={css.headerToolItem} onClick={getUser}>
          <UserOutlined />
          <span>{localStorage.getItem('userName')}</span>
        </div>
        <div className={css.headerToolItem} onClick={handleLogOut}>
          <ImportOutlined />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
