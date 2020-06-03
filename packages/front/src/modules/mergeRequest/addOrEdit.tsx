import React, { useState } from 'react';
import { Drawer, Button, Form, Input, message } from 'antd';
import * as css from './styles/addorEdit.modules.less';
import { CheckOutlined } from '@ant-design/icons';
import { ajax } from '@ofm/ajax';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getMergeRequest: Function;
  filter: any;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, filter, getMergeRequest } = props;
  const [form] = Form.useForm();
  const [title, setTitle] = useState('');
  const onClose = () => {
    setVisible(false);
    setTitle('');
  };

  const handleAdd = () => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        ajax
          .post('/project/save', values)
          .then(result => {
            const {
              data: { statusCode, message: msg },
            } = result;
            if (statusCode === 0) {
              setVisible(false);
              message.success(msg);
              getMergeRequest(filter);
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
      title="Create Branch"
      placement="right"
      closable={true}
      onClose={onClose}
      visible={visible}
      width={590}
      destroyOnClose={true}
      className={css.addProjectDrawer}
      footer={renderFooter()}>
      <Form form={form} name="basic" layout="vertical" initialValues={{ remember: true }}>
        <Form.Item label="Title" name="Title" rules={[{ required: true, message: 'Please input title!' }]}>
          <Input value={title} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddOrEditProject;
