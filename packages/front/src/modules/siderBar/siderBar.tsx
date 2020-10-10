import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import * as css from './styles/sideBar.modules.less';
import { history as browserHistory } from '@ofm/history';
import { menuRoute } from './constant';

interface SideBarProps {
  match: any;
}

const SideBar: React.SFC<SideBarProps> = (props: SideBarProps) => {
  const { match } = props;
  const [selectKeys, setSelectKeys] = useState<any[]>([]);

  useEffect(() => {
    if (match) {
      let projectId = match.params.projectId;
      menuRoute(Number(projectId)).map((item: any, index: number) => {
        if (match.url === item) {
          let selectIndex = (index + 1).toString();
          setSelectKeys([selectIndex]);
        }
      });
    }
  }, [match]);

  const handleClick = (e: any) => {
    setSelectKeys([e.key]);
    let projectId = match.params.projectId;
    let linkUrl = menuRoute(Number(projectId))[Number(e.key) - 1];
    browserHistory.push(linkUrl);
  };

  return (
    <Menu
      onClick={handleClick}
      className={css.sidebar}
      selectedKeys={selectKeys}
      defaultSelectedKeys={['1']}
      mode="inline">
      <Menu.ItemGroup key="g1" title="Navigation">
        <Menu.Item key="1">Languages</Menu.Item>
        <Menu.Item key="2">Branches</Menu.Item>
        <Menu.Item key="3">Merge Request</Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup key="g2" title="Action">
        <Menu.Item key="4">Download</Menu.Item>
        {localStorage.getItem('userType') === '0' && <Menu.Item key="5">Delete Project</Menu.Item>}
      </Menu.ItemGroup>
    </Menu>
  );
};

export default SideBar;
