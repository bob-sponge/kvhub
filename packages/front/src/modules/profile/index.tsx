import React from 'react';
import Container from '../../container';
import { Tabs } from 'antd';
import * as css from './style/index.modules.less';
import ProfileInfo from './profile';
import ChangePwd from './changePwd';

const { TabPane } = Tabs;

interface ProfileProps {}

const Profile: React.SFC<ProfileProps> = (_props: ProfileProps) => {
  return (
    <Container>
      <div className={css.profile}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Profile" key="1">
            <ProfileInfo />
          </TabPane>
          <TabPane tab="Change Password" key="2">
            <ChangePwd />
          </TabPane>
        </Tabs>
      </div>
    </Container>
  );
};

export default Profile;
