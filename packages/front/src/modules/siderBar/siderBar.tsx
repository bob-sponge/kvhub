import React, { useState, useEffect, useCallback } from 'react';
import { Menu, message, Modal } from 'antd';
import * as css from './styles/sideBar.modules.less';
import { history } from '../../history';
import { menuRoute } from './constant';
import * as Api from '../../api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

interface SideBarProps {
  match: any;
}

const SideBar: React.FC<SideBarProps> = (props: SideBarProps) => {
  const { match } = props;
  const [selectKeys, setSelectKeys] = useState<any[]>([]);

  useEffect(() => {
    if (match) {
      let projectId = match.params.projectId;
      window.console.log(menuRoute(Number(projectId)));
      menuRoute(Number(projectId)).map((item: any, index: number) => {
        if (match.url === `${item}`) {
          let selectIndex = (index + 1).toString();
          setSelectKeys([selectIndex]);
        }
      });
    }
  }, [match]);

  const handleClick = (e: any) => {
    if (e.key === '5') {
      confirmDelete();
    } else {
      setSelectKeys([e.key]);
      let projectId = match.params.projectId;
      let linkUrl = menuRoute(Number(projectId))[Number(e.key) - 1];
      history.push(`${linkUrl}`);
    }
  };

  const confirmDelete = useCallback(async () => {
    if (match) {
      let projectId = match.params.projectId;
      confirm({
        title: 'Do you want to delete the project?',
        icon: <ExclamationCircleOutlined />,
        async onOk() {
          let result = await Api.deleteProjectApi(projectId);
          const { success } = result;
          if (success) {
            message.success('Delete project successfully!');
            history.push('/dashobard');
          }
        },
      });
    }
  }, [match]);

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
        {/* <Menu.Item key="4">Download</Menu.Item> */}
        {localStorage.getItem('userType') === '0' && <Menu.Item key="5">Delete Project</Menu.Item>}
      </Menu.ItemGroup>
    </Menu>
  );
};

export default SideBar;
