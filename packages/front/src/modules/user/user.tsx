import React, { useEffect, useState, useCallback } from 'react';
import Container from '../../container';
import * as css from './index.modules.less';
import { Table, message, Modal, Form, Input } from 'antd';
import * as Api from '../../api/user';
import { columns } from './constant';

interface UserProps {}

const User: React.SFC<UserProps> = (_props: UserProps) => {
  const [form] = Form.useForm();
  const [navs, setNavs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<any>({
    pageNo: 1,
    pageSize: 10,
  });
  const [visible, setVisible] = useState<boolean>(false);
  const [resetPwd, setResetPwd] = useState<any>({});

  useEffect(() => {
    getUser();
    setNavs([
      {
        name: 'Home',
        url: '/',
      },
      {
        name: 'Project Dashboard',
        url: '',
      },
    ]);
  }, []);

  const getUser = async () => {
    setLoading(true);
    let result = await Api.getUserApi(filter);
    setLoading(false);
    const { success, data } = result;
    if (success && data) {
      const { total: totalSize, rows } = data;
      setTotal(totalSize);
      setUserList(rows);
    }
  };

  const setAdmin = (rowData: any) => {
    setUser(rowData.id);
  };

  const setUser = async (id: any) => {
    let result = await Api.setAdminApi(id);
    const { success, data } = result;
    if (success) {
      message.success(data);
      getUser();
    }
  };

  const showTotal = () => {
    return `Total ${total} items`;
  };

  const onChange = (page: number, _pageSize: number) => {
    filter.pageNo = page;
    setFilter({ ...filter });
  };

  const onPageChange = (_current: number, size: number) => {
    filter.pageNo = 1;
    filter.pageSize = size;
    setFilter({ ...filter });
  };

  const onDelete = (rowData: any) => {
    deleteUser(rowData.id);
  };

  const deleteUser = async (id: any) => {
    let result = await Api.delUserApi(id);
    const { success, data } = result;
    if (success) {
      message.success(data);
      getUser();
    }
  };

  const onReset = (params: any) => {
    resetPwd.id = params.id;
    setResetPwd({ ...resetPwd });
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setResetPwd({});
  };

  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        let params = Object.assign({}, resetPwd, values);
        reset(params);
      }
    });
  }, [resetPwd]);

  const reset = async (params: any) => {
    let result = await Api.resetPwdApi(params);
    const { success, data } = result;
    if (success) {
      message.success(data);
    }
  };

  const onContentChange = (label: string) => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        resetPwd[label] = values[label].trim();
        setResetPwd({ ...resetPwd });
      }
    });
  };

  return (
    <Container navs={navs}>
      <div className={css.user}>
        <div className={css.userTitle}>User Management</div>
        <div className={css.userTable}>
          <Table
            loading={loading}
            dataSource={userList}
            columns={columns(onDelete, onReset, setAdmin)}
            pagination={{
              position: ['bottomRight'],
              showSizeChanger: true,
              showTotal: showTotal,
              pageSizeOptions: ['10', '20', '50'],
              onChange: onChange,
              total,
              pageSize: filter.pageSize,
              current: filter.pageNo,
              onShowSizeChange: onPageChange,
            }}
          />
        </div>
        <Modal destroyOnClose={true} title="Reset Password" visible={visible} onOk={handleOk} onCancel={handleCancel}>
          <Form form={form} name="basic" layout="vertical" initialValues={{ remember: true }}>
            <Form.Item
              label="Old Password"
              name="oldPass"
              rules={[{ required: true, message: 'Please input your old password!' }]}>
              <Input onChange={() => onContentChange('oldPass')} />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPass"
              rules={[{ required: true, message: 'Please input your new password!' }]}>
              <Input onChange={() => onContentChange('newPass')} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Container>
  );
};

export default User;
