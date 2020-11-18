import React, { useState, useEffect } from 'react';
import * as css from './style/index.modules.less';
import ContainerMenu from '../../containerMenu';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Table, Spin, message } from 'antd';
import { columns } from './tableConfig';
import AddorEditBranch from './addOrEditBranch';
import { history } from '../../history';
import * as Api from '../../api/branch';
import { projectDetailApi } from '../../api/index';

const { Search } = Input;

interface BranchProps {
  match: any;
}

const Branches: React.FC<BranchProps> = (props: BranchProps) => {
  const { match } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    page: 1,
    size: 10,
    content: '',
    projectId: NaN,
  });
  const getProjectDetail = async (id: any) => {
    setLoading(true);
    await projectDetailApi(id);
    setLoading(false);
  };

  useEffect(() => {
    const projectid = match.params.projectId;
    getProjectDetail(projectid);
    filter.projectId = Number(projectid);
    setFilter({ ...filter });
  }, [match]);

  useEffect(() => {
    if (filter.projectId) {
      getBranch(filter);
    }
  }, [filter]);

  const getBranch = async (params: any) => {
    setLoading(true);
    let result = await Api.branchAllApi(params);
    setLoading(false);
    const { success, data } = result;
    if (success && data) {
      const { total: totalItem, data: source } = data;
      setTotal(totalItem);
      setBranchList(source);
    }
  };

  const showTotal = () => {
    return `Total ${total} items`;
  };

  const onCompare = (record: any) => {
    history.push(`/branch/compare/${record.id}`);
  };

  const onDelete = async (record: any) => {
    let result = await Api.deleteBranchApi(record.id);
    const { success, data } = result;
    if (success) {
      let currentTotal = total - 1;
      if (currentTotal !== 0 && currentTotal % filter.size === 0 && filter.page !== 1) {
        filter.page = filter.page - 1;
      }
      setFilter({ ...filter });
      message.success(data);
    }
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
      <div className={css.branchWapper}>
        <div className={css.basicTitle}>
          <div className={css.title}>Branches</div>
          <div className={css.operation}>
            <Search
              placeholder="Searchbox"
              onSearch={value => onSearch(value)}
              style={{ width: 264, marginRight: 16 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
              Create Branch
            </Button>
          </div>
        </div>
        <Spin spinning={loading}>
          <div className={css.branchTable}>
            <Table
              rowKey={record => record.id}
              columns={columns(onCompare, onDelete)}
              dataSource={branchList}
              pagination={{
                position: ['bottomRight'],
                showSizeChanger: true,
                showTotal: showTotal,
                pageSizeOptions: ['10', '20', '50'],
                onChange: onChange,
                total,
                pageSize: filter.size,
                current: filter.page,
                onShowSizeChange: onPageChange,
              }}
            />
          </div>
        </Spin>
      </div>
      <AddorEditBranch visible={visible} setVisible={setVisible} getBranch={getBranch} filter={filter} match={match} />
    </ContainerMenu>
  );
};

export default Branches;
