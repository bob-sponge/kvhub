import React from 'react';
import Header from './modules/header';
import Navs from './modules/commonNav';
import SideBar from './modules/siderBar';

interface ContainerProps {
  children?: React.ReactNode;
}

function ContainerMenu(props: ContainerProps) {
  return (
    <div>
      <Header />
      <div className="container_menu">
        <SideBar />
        <div className="wapper">
          <Navs />
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default ContainerMenu;
