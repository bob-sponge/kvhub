import React, { useState, useEffect } from 'react';
import { Drawer, Button, Form, Input, Select, message } from 'antd';
import * as css from './style/addOrEditProject.modules.less';
import { CheckOutlined } from '@ant-design/icons';
import { ajax } from '@ofm/ajax';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getProjectAll: Function;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, getProjectAll } = props;
  const [form] = Form.useForm();
  const [languages, setLanguages] = useState<any[]>([]);
  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    ajax.get('/languages/all').then(result => {
      const { data } = result;
      setLanguages(data);
    });
  }, []);

  const handleAdd = () => {
    form.validateFields().then(values => {
      window.console.log(values);
      if (!values.outOfDate) {
        ajax
          .post('/project/dashboard/save', values)
          .then(result => {
            const {
              data: { statusCode, message: msg },
            } = result;
            if (statusCode === 0) {
              setVisible(false);
              message.success(msg);
              getProjectAll();
              form.resetFields();
            }
          })
          .catch(errorInfo => {
            setVisible(false);
            message.error(errorInfo);
          });
      }
    });
  };

  const renderFooter = () => {
    return (
      <div className={css.drawerFooter}>
        <Button onClick={() => setVisible(false)}>Cancel</Button>
        <Button icon={<CheckOutlined />} type="primary" onClick={handleAdd}>
          Submit
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      title="Add New Project"
      placement="right"
      closable={true}
      onClose={onClose}
      visible={visible}
      width={590}
      destroyOnClose={true}
      className={css.addProjectDrawer}
      footer={renderFooter()}>
      <Form form={form} name="basic" layout="vertical" initialValues={{ remember: true }}>
        <Form.Item
          label="Project Name"
          name="name"
          rules={[{ required: true, message: 'Please input your project name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Reference Language"
          name="referenceId"
          rules={[{ required: true, message: 'Please select reference language!' }]}>
          <Select>
            {languages &&
              languages.length > 0 &&
              languages.map(item => {
                return <Select.Option value={item.id}>{item.name}</Select.Option>;
              })}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddOrEditProject;
