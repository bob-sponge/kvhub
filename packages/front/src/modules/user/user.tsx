import React, { useEffect, useState, useCallback } from 'react';
import Container from '../../container';
import * as css from './index.modules.less';
import { Table, message, Modal, Form, Input } from 'antd';
import * as Api from '../../api/user';
import { columns } from './constant';

interface UserProps {}

const User: React.FC<UserProps> = (_props: UserProps) => {
  const [form] = Form.useForm();
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
    getUser(filter);
  }, [filter]);

  const getUser = async (filters: any) => {
    setLoading(true);
    let result = await Api.getUserApi(filters);
    setLoading(false);
    const { success, data } = result;
    if (success && data) {
      const { total: totalSize, rows } = data;
      setTotal(totalSize);
      setUserList(rows);
    }
  };

  const setAdmin = (rowData: any) => {
    setUser(rowData);
  };

  const setUser = useCallback(
    async (rowData: any) => {
      const { id, admin } = rowData;
      let level = admin === 0 ? 1 : 0;
      let result = await Api.setRoleApi(id, level);
      const { success, data } = result;
      if (success) {
        message.success(data);
        getUser(filter);
      }
    },
    [filter],
  );

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

  const deleteUser = useCallback(
    async (id: any) => {
      let result = await Api.delUserApi(id);
      const { success, data } = result;
      if (success) {
        message.success(data);
        getUser(filter);
      }
    },
    [filter],
  );

  const onReset = (params: any) => {
    resetPwd.userId = params.id;
    setResetPwd({ ...resetPwd });
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setResetPwd({});
    form.resetFields();
  };

  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        const { newPass, newPass1 } = values;
        if (newPass !== newPass1) {
          Modal.error({
            title: 'The two passwords do not match.',
          });
        } else {
          let params = Object.assign({}, resetPwd, values);
          reset(params);
        }
      }
    });
  }, [resetPwd]);

  const reset = async (params: any) => {
    let result = await Api.resetOnePwdApi(params);
    const { success, data } = result;
    if (success) {
      message.success(data);
      handleCancel();
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

  const checkValue = (_: any, value: any) => {
    const regStr = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*])[\da-zA-Z~!@#$%^&*]{6,16}$/g;
    const reg = new RegExp(regStr);
    if (!value) {
      return Promise.reject('Please input your new password!');
    } else if (!reg.test(value)) {
      return Promise.reject(
        // eslint-disable-next-line max-len
        'The password must contain letters, numbers, and special characters (~!@#$%^&*) and contains 6 to 16 characters.',
      );
    } else {
      return Promise.resolve();
    }
  };

  return (
    <Container>
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
              label="New Password"
              name="newPass"
              rules={[
                {
                  validator: checkValue,
                },
              ]}>
              <Input onChange={() => onContentChange('newPass')} type="password" />
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="newPass1"
              rules={[
                {
                  validator: checkValue,
                },
              ]}>
              <Input onChange={() => onContentChange('newPass1')} type="password" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Container>
  );
};

export default User;
