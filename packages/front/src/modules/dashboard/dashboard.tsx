import React, { useState, useEffect } from 'react';
import * as css from './style/dashboard.modules.less';
import { Button, Progress } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Container from '../../container';
import { cardListData, doneColor, processColor, formatNumber, timeAgo } from './constant';
import AddOrEditProject from './addOrEditProject';
import { ajax } from '@ofm/ajax';

const Dashboard: React.SFC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    ajax.get('/project/dashboard/all').then(result => {
      window.console.log(result);
    });
  }, []);

  const addProject = () => {
    setVisible(true);
  };
  return (
    <Container>
      <div>
        <div className={css.dashboardTitle}>
          <div className={css.title}>Project Dashboard</div>
          <div className={css.operation}>
            <Button type="primary" ghost icon={<UploadOutlined />}>
              secondary
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={addProject}>
              Add Project
            </Button>
          </div>
        </div>
        <div className={css.dashboardContent}>
          {cardListData &&
            cardListData.length > 0 &&
            cardListData.map(item => {
              const isDone = item.translateKeysNumber === item.keysNumber;
              const precent = (item.translateKeysNumber / item.keysNumber) * 100;
              return (
                <div className={css.cardWapper}>
                  <div className={css.cardList}>
                    <div className={css.cardTitle}>{item.name}</div>
                    <div className={css.cardTranslate}>
                      <div className={css.keys}>
                        <div className={css.keysCurrent} style={{ color: isDone ? doneColor : processColor }}>
                          {formatNumber(item.translateKeysNumber)}
                        </div>
                        <div className={css.keysTotal}>{formatNumber(item.keysNumber)}</div>
                      </div>
                      <div className={css.precent} style={{ color: isDone ? doneColor : processColor }}>
                        <span>{isDone ? 'Done 100' : precent.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={css.cardBar}>
                      <Progress
                        percent={precent}
                        size="small"
                        strokeColor={isDone ? doneColor : processColor}
                        showInfo={false}
                      />
                    </div>
                    <div className={css.cardUpdate}>
                      <div className={css.language}>
                        {item.languages.map((list: string) => {
                          return <span>{list}</span>;
                        })}
                        {` ${item.languages.length} languages`}
                      </div>
                      <div>{timeAgo(item.time)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <AddOrEditProject visible={visible} setVisible={setVisible} />
      </div>
    </Container>
  );
};

export default Dashboard;
