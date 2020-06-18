import React, { useState, useEffect } from 'react';
import ContainerMenu from '../../containerMenu';
import * as css from './styles/mergeRequest.modules.less';
import { Button, Table, message, Input, Spin } from 'antd';
import { history } from '@ofm/history';
import { ajax } from '@ofm/ajax';
import { PlusOutlined } from '@ant-design/icons';
import { columns } from './tableConfig';
import AddOrEdit from './addOrEdit';
import { branchMergeListApi } from '../../api/mergeRequest';
const { Search } = Input;

interface MergeRequestProps {
  match: any;
}

const MergeRequest = (props: MergeRequestProps) => {
  const { match } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [mergeRequestList, setMergeRequestList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    page: 1,
    size: 10,
    content: '',
  });

  useEffect(() => {
    getMergeRequest();
  }, [filter]);

  const getMergeRequest = async () => {
    const projectId = match.params.projectId;
    const detail = {
      projectId,
      keywrod: filter.content,
    };
    const result = await branchMergeListApi(detail);
    setTotal(result.data);
    setMergeRequestList(result.data);
  };

  const showTotal = () => {
    return `Total ${total} items`;
  };

  const onMerge = (record: any) => {
    history.push(`/mergeRequest/merge/${record.id}`);
  };

  const onDelete = (record: any) => {
    ajax
      .delete(`/mergeRequest/delete/${record.id}`)
      .then(result => {
        setLoading(false);
        const {
          data: { statusCode, message: msg },
        } = result;
        if (statusCode === 0) {
          let currentTotal = total - 1;
          if (currentTotal !== 0 && currentTotal % filter.size === 0 && filter.page !== 1) {
            filter.page = filter.page - 1;
          }
          setFilter({ ...filter });
          message.success(msg);
        }
      })
      .catch(error => {
        if (error) {
          setLoading(false);
        }
      });
  };

  const onChange = (page: number, _pageSize: number) => {
    filter.page = page;
    setFilter({ ...filter });
  };

  const onPageChange = (_current: number, size: number) => {
    filter.page = 1;
    filter.size = size;
    setFilter({ ...filter });
  };

  const onSearch = (value: string) => {
    filter.content = value === '' ? '' : value.trim();
    filter.page = 1;
    filter.size = 10;
    setFilter({ ...filter });
  };

  return (
    <ContainerMenu match={match}>
      <div className={css.mergeWapper}>
        <div className={css.basicTitle}>
          <div className={css.title}>Merge Request</div>
          <div className={css.operation}>
            <Search
              placeholder="Searchbox"
              onSearch={value => onSearch(value)}
              style={{ width: 264, marginRight: 16 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
              Create Merge Request
            </Button>
          </div>
        </div>
        <Spin spinning={loading}>
          <div className={css.mergeTable}>
            <Table
              columns={columns(onMerge, onDelete)}
              dataSource={mergeRequestList}
              pagination={{
                position: 'bottomRight',
                showSizeChanger: true,
                showTotal: showTotal,
                pageSizeOptions: ['10', '20', '50'],
                onChange: onChange,
                total,
                onShowSizeChange: onPageChange,
              }}
            />
          </div>
        </Spin>
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
