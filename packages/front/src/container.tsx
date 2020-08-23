import React from 'react';
import Header from './modules/header';
import Navs from './modules/commonNav';

interface ContainerProps {
  children?: React.ReactNode;
  navs?: any;
}

const Container: React.SFC<ContainerProps> = (props: ContainerProps) => {
  const { navs } = props;
  return (
    <div>
      <Header />
      <div className="container">
        <Navs navs={navs} />
        {props.children}
      </div>
    </div>
  );
};

export default Container;
