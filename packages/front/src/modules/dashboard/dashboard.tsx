import React, { useState, useEffect } from 'react';
import * as css from './style/dashboard.modules.less';
import { Button, Progress, Empty, Spin } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Container from '../../container';
import { doneColor, processColor, formatNumber, timeAgo } from './constant';
import AddOrEditProject from './addOrEditProject';
import { ajax } from '@ofm/ajax';

const Dashboard: React.SFC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getProjectAll();
  }, []);

  const getProjectAll = () => {
    setLoading(true);
    ajax
      .get('/project/dashboard/all')
      .then(result => {
        setLoading(false);
        const {
          data: { statusCode, data },
        } = result;
        if (statusCode === 0) {
          setProjectList(data);
        }
      })
      .catch(error => {
        if (error) {
          setLoading(false);
        }
      });
  };

  const addProject = () => {
    setVisible(true);
  };
  return (
    <Spin spinning={loading}>
      <Container>
        <div>
          <div className={css.dashboardTitle}>
            <div className={css.title}>Project Dashboard</div>
            <div className={css.operation}>
              <Button type="primary" ghost icon={<UploadOutlined />}>
                Upload
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={addProject}>
                Add Project
              </Button>
            </div>
          </div>
          <div className={css.dashboardContent}>
            {projectList &&
              projectList.length > 0 &&
              projectList.map((item, index) => {
                const isDone = item.translatedKeysNumber === item.KeysNumber;
                const precent = (item.translatedKeysNumber / item.KeysNumber) * 100;
                return (
                  <div className={css.cardWapper} key={index}>
                    <div className={css.cardList}>
                      <div className={css.cardTitle}>{item.name}</div>
                      <div className={css.cardTranslate}>
                        <div className={css.keys}>
                          <div className={css.keysCurrent} style={{ color: isDone ? doneColor : processColor }}>
                            {formatNumber(item.translatedKeysNumber)}
                          </div>
                          <div className={css.keysTotal}>{formatNumber(item.KeysNumber)}</div>
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
          {projectList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          <AddOrEditProject visible={visible} setVisible={setVisible} getProjectAll={getProjectAll} />
        </div>
      </Container>
    </Spin>
  );
};

export default Dashboard;
