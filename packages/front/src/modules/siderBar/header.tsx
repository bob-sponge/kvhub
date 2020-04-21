import React from 'react';
import './header.less';

const imgSrc = require('./header.png');

const Header = () => {
  return (
    <div className={'header'}>
      <div className={'header-left'}>
        <img src={imgSrc} />
        <p>{'Translation'}</p>
        <p>{'User Management'}</p>
      </div>
      <div className={'header-right'}>
        <div className={'header-tool-item'}>
          <span>{'Admin123456'}</span>
        </div>
        <div className={'header-tool-item'}>
          <span>{'Logout'}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
