import React from 'react';
import Header from './modules/header';
import Navs from './modules/commonNav';

interface ContainerProps {
  children?: React.ReactNode;
}

function Container(props: ContainerProps) {
  return (
    <div>
      <Header />
      <div className="container">
        <Navs />
        {props.children}
      </div>
    </div>
  );
}

export default Container;
