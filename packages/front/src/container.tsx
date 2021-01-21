import React from 'react';
import Header from './modules/header';
import Navs from './modules/commonNav';
import { Scrollbars } from 'react-custom-scrollbars';

interface ContainerProps {
  children?: React.ReactNode;
  navs?: any;
}

const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { navs } = props;
  return (
    <div>
      <Header />
      <div className="container">
        <Scrollbars style={{ height: 'calc(100vh - 61px)' }}>
          <Navs navs={navs} />
          {props.children}
        </Scrollbars>
      </div>
    </div>
  );
};

export default Container;
