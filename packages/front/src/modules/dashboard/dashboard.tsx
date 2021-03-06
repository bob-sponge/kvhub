import React, { useState, useEffect } from 'react';
import * as css from './style/dashboard.modules.less';
import { Button, Progress, Empty, Spin, Modal, message } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Container from '../../container';
import { doneColor, processColor, formatNumber } from './constant';
import AddOrEditProject from './addOrEditProject';
import * as Api from '../../api';
import { history } from '../../history';
import moment from 'moment';

const { confirm } = Modal;

const Dashboard: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getProjectAll();
  }, []);

  const getProjectAll = async () => {
    setLoading(true);
    let result = await Api.projectAllListApi();
    setLoading(false);
    const { success, data } = result;
    if (success && data) {
      setProjectList(data);
    }
  };

  const addProject = () => {
    setVisible(true);
  };

  const handleClick = (id: any) => {
    history.push(`/languages/${id}`);
  };

  const deleteProject = (e: any, id: any) => {
    confirm({
      title: 'Do you want to delete the project?',
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        let result = await Api.deleteProjectApi(id);
        if (result.success) {
          getProjectAll();
          message.success('Delete project successfully!');
        }
      },
    });
    if (e) {
      e.stopPropagation();
    }
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
                const { translatedKeysNumber, KeysNumber } = item;
                const isDone = translatedKeysNumber === KeysNumber && !(translatedKeysNumber === 0 && KeysNumber === 0);
                const precent =
                  translatedKeysNumber === 0 && KeysNumber === 0 ? 0 : (translatedKeysNumber / KeysNumber) * 100;
                return (
                  <div className={css.cardWapper} key={index}>
                    <div className={css.cardList} onClick={() => handleClick(item.id)}>
                      <div className={css.cardTitle}>
                        <div className={css.label} style={{ WebkitBoxOrient: 'vertical' }} title={item.name}>
                          {item.name}
                        </div>
                        {localStorage.getItem('userType') === '0' && (
                          <div onClick={e => deleteProject(e, item.id)}>
                            <DeleteOutlined />
                          </div>
                        )}
                      </div>
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
                          {item.languages.map((list: string, i: number) => {
                            return <span key={i}>{list}</span>;
                          })}
                          {` ${item.languages.length} languages`}
                        </div>
                        <div>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {projectList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          {visible && <AddOrEditProject visible={visible} setVisible={setVisible} getProjectAll={getProjectAll} />}
        </div>
      </Container>
    </Spin>
  );
};

export default Dashboard;
