import React, { useState, useEffect } from 'react';
import { Drawer, Button, Form, Input, Select, message } from 'antd';
import * as css from './style/addorEditBranch.modules.less';
import { CheckOutlined } from '@ant-design/icons';
import { ajax } from '@ofm/ajax';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getBranch: Function;
  filter: any;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, filter, getBranch } = props;
  const [form] = Form.useForm();
  const [project, setProject] = useState<any[]>([]);
  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    ajax.get('/project/all').then(result => {
      const {
        data: { statusCode, data },
      } = result;
      if (statusCode === 0) {
        setProject(data);
      }
    });
  }, []);

  const handleAdd = () => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        ajax
          .post('/branch/save', values)
          .then(result => {
            const {
              data: { statusCode, message: msg },
            } = result;
            if (statusCode === 0) {
              setVisible(false);
              message.success(msg);
              getBranch(filter);
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
        <Form.Item label="project" name="projectId" rules={[{ required: true, message: 'Please select project!' }]}>
          <Select>
            {project &&
              project.length > 0 &&
              project.map(item => {
                return <Select.Option value={item.id}>{item.name}</Select.Option>;
              })}
          </Select>
        </Form.Item>
        <Form.Item label="Branch Name" name="name" rules={[{ required: true, message: 'Please input Branch Name!' }]}>
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddOrEditProject;
