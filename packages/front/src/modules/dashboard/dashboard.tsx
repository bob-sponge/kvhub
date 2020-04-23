import React from 'react';
import * as css from './style/dashboard.modules.less';
import { Button } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Container from '../../container';
// import { cardListData } from './constant';

const Dashboard: React.SFC = () => {
  // const renderCardList = (data: any[]) => {
  //   if (data && data.length) {
  //     data.map(item => {
  //       window.console.log(item);
  //     });
  //   }
  // };

  return (
    <Container>
      <div>
        <div className={css.dashboardTitle}>
          <div className={css.title}>Project Dashboard</div>
          <div className={css.operation}>
            <Button type="primary" ghost icon={<UploadOutlined />}>
              secondary
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              Add Project
            </Button>
          </div>
        </div>
        <div className={css.dashboardContent}>
          {/* {renderCardList(cardListData)} */}
          {/* {cardListData &&
            cardListData.length > 0 &&
            cardListData.map(item => {
              return (
                <div className={css.cardList}>
                  <div className={css.cardTitle}>{item.name}</div>
                  <div className={css.cardTranslate}>
                    <div className={css.keys}>
                      <div className={css.keysCurrent}>123</div>
                      <div className={css.keysTotal}>1111</div>
                    </div>
                    <div className={css.precent}>Done 100%</div>
                  </div>
                  <div className={css.cardBar}>
                    <Progress percent={30} size="small" showInfo={false} />
                  </div>
                  <div className={css.cardUpdate}>
                    <div className={css.language}>(1212)</div>
                    <div>1111</div>
                  </div>
                </div>
              );
            })} */}
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
