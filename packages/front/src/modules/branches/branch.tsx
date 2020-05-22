import React, { useState, useEffect } from 'react';
import * as css from './style/index.modules.less';
import ContainerMenu from '../../containerMenu';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Table, Spin, message } from 'antd';
import { columns } from './tableConfig';
import AddorEditBranch from './addOrEditBranch';
import { history } from '@ofm/history';
import { ajax } from '@ofm/ajax';
const { Search } = Input;

const Branches: React.SFC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    page: 1,
    size: 10,
    content: '',
  });

  useEffect(() => {
    getBranch(filter);
  }, [filter]);

  const getBranch = (params: any) => {
    ajax
      .post('/branch/all', params)
      .then(result => {
        setLoading(false);
        const {
          data: {
            statusCode,
            data: { total: totalItem, data: source },
          },
        } = result;
        if (statusCode === 0) {
          setTotal(totalItem);
          setBranchList(source);
        }
      })
      .catch(error => {
        if (error) {
          setLoading(false);
        }
      });
  };

  const showTotal = () => {
    return `Total ${total} items`;
  };

  const onCompare = (record: any) => {
    history.push(`/branch/compare/${record.id}`);
  };

  const onDelete = (record: any) => {
    ajax
      .delete(`/branch/delete/${record.id}`)
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
    <ContainerMenu>
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
              columns={columns(onCompare, onDelete)}
              dataSource={branchList}
              pagination={{
                position: 'bottomRight',
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
      <AddorEditBranch visible={visible} setVisible={setVisible} getBranch={getBranch} filter={filter} />
    </ContainerMenu>
  );
};

export default Branches;
