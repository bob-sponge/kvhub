import React from 'react';
import { Drawer, Button, Form, Input, Select } from 'antd';
import * as css from './style/addOrEditProject.modules.less';
import { CheckOutlined } from '@ant-design/icons';
import * as api from '../../api';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible } = props;
  const [form] = Form.useForm();
  const onClose = () => {
    setVisible(false);
  }

  const onFinish = (values: any) => {
    console.log(values);
  };

  const handleAdd = () => {
    form.validateFields().then(values => {
      window.console.log(values);
      api.addProjectApi(values).then(result =>{
        window.console.log(result);
      })
    }).catch(errorInfo => {
      window.console.log('error', errorInfo);
    });
  }

  const renderFooter = () => {
    return (
      <div className={css.drawerFooter}>
        <Button>Cancel</Button>
        <Button icon={<CheckOutlined />} type="primary" onClick={handleAdd}>Submit</Button>
      </div>
    )
  }

  return (
    <Drawer
      title="Add New Project"
      placement="right"
      closable={true}
      onClose={onClose}
      visible={visible}
      width={590}
      className={css.addProjectDrawer}
      footer={renderFooter()}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Project Name"
          name="projectname"
          rules={[{ required: true, message: 'Please input your project name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Reference Language" name="language" rules={[{ required: true, message: 'Please select reference language!' }]}>
          <Select>
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  )
};

export default AddOrEditProject;