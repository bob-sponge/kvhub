import React, { useState, useEffect } from 'react';
import ContainerMenu from '../../containerMenu';
import * as css from './styles/mergeRequest.modules.less';
import { Button, Table, message, Input } from 'antd';
import { history } from '@ofm/history';
import { PlusOutlined } from '@ant-design/icons';
import { columns } from './tableConfig';
import AddOrEdit from './addOrEdit';
import * as Api from '../../api/mergeRequest';
import { projectDetailApi } from '../../api';

const { Search } = Input;

interface MergeRequestProps {
  match: any;
}

const MergeRequest = (props: MergeRequestProps) => {
  const { match } = props;
  const projectId = match.params.projectId;
  const [visible, setVisible] = useState<boolean>(false);
  const [mergeRequestList, setMergeRequestList] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const [navs, setNavs] = useState<any[]>([]);
  const [projectDetail, setProjectDetail] = useState<any>({});

  const getProjectDetail = async (id: any) => {
    let result = await projectDetailApi(id);
    const { success, data } = result;
    if (success && data) {
      setProjectDetail(data);
    }
  };

  useEffect(() => {
    const projectid = match.params.projectId;
    getProjectDetail(projectid);
  }, [match]);

  useEffect(() => {
    const { name } = projectDetail;
    setNavs([
      {
        name: 'Home',
        url: '/',
      },
      {
        name: 'Project Dashboard',
        url: '/dashboard',
      },
      {
        name,
        url: '',
      },
    ]);
  }, [projectDetail]);

  useEffect(() => {
    getMergeRequest();
  }, [filter]);

  const getMergeRequest = async () => {
    const detail = {
      projectId,
      keywrod: filter,
    };
    const result = await Api.branchMergeListApi(detail);
    setMergeRequestList(result.data);
  };

  const onMerge = (record: any) => {
    history.push(`/mergeRequest/detail/${record.id}`);
  };

  const onResufe = async (record: any) => {
    const res = await Api.branchMergeRefuseApi(record.id);
    getMergeRequest();
    message.success(res && res.data);
  };

  const onSearch = (value: string) => {
    setFilter(value);
  };

  const goToBranchCompare = () => {
    history.push(`/branch/compare/${projectId}`);
  };

  return (
    <ContainerMenu match={match} navs={navs}>
      <div className={css.mergeWapper}>
        <div className={css.basicTitle}>
          <div className={css.title}>Merge Request</div>
          <div className={css.operation}>
            <Search
              placeholder="Searchbox"
              onSearch={value => onSearch(value)}
              style={{ width: 264, marginRight: 16 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={goToBranchCompare}>
              Create Merge Request
            </Button>
          </div>
        </div>
        <div className={css.mergeTable}>
          <Table
            rowKey={record => record.id}
            columns={columns(onMerge, onResufe)}
            dataSource={mergeRequestList}
            pagination={false}
          />
        </div>
      </div>
      <AddOrEdit
        id={match.params.projectId}
        visible={visible}
        setVisible={setVisible}
        getMergeRequest={getMergeRequest}
        filter={filter}
      />
    </ContainerMenu>
  );
};

export default MergeRequest;
