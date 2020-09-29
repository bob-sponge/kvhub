import React from 'react';
import Header from './modules/header';
import Navs from './modules/commonNav';
import SideBar from './modules/siderBar';

interface ContainerProps {
  children?: React.ReactNode;
  match: any;
  navs?: any;
}

const ContainerMenu: React.SFC<ContainerProps> = (props: ContainerProps) => {
  const { match, navs } = props;

  return (
    <div>
      <Header />
      <div className="container_menu">
        <SideBar match={match} />
        <div className="wapper">
          <Navs navs={navs} />
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default ContainerMenu;
