import React, { useCallback } from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
const Item = Breadcrumb.Item;

interface NavProps {
  navs: any[];
}

const Nav: React.FC<NavProps> = (props: NavProps) => {
  const { navs } = props;

  const getNavs = useCallback(() => {
    return (
      navs &&
      navs.length > 0 &&
      navs.map((item: any, index: number) => {
        if (!item.url) {
          return (
            <Item>
              {index === 0 && <HomeOutlined />}
              <span>{item.name}</span>
            </Item>
          );
        } else {
          return (
            <Item href={item.url}>
              {index === 0 && <HomeOutlined />}
              <span>{item.name}</span>
            </Item>
          );
        }
      })
    );
  }, [navs]);

  return <Breadcrumb style={{ margin: '16px 24px' }}>{getNavs()}</Breadcrumb>;
};

export default Nav;
