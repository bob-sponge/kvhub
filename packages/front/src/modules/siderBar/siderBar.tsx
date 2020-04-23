import React from 'react';
import { Menu } from 'antd';
import * as css from './styles/sideBar.modules.less';

const SideBar = () => {
  const handleClick = (e: any) => {
    window.console.log('click ', e);
  };

  return (
    <Menu
      onClick={handleClick}
      className={css.sidebar}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      mode="inline">
      <Menu.ItemGroup key="g1" title="Navigation">
        <Menu.Item key="1">Languages</Menu.Item>
        <Menu.Item key="2">Branches</Menu.Item>
        <Menu.Item key="3">Marge Request</Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup key="g2" title="Action">
        <Menu.Item key="4">Download</Menu.Item>
        <Menu.Item key="5">Delete Project</Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  );
};

export default SideBar;
