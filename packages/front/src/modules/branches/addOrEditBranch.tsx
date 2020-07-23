import React, { useState, useEffect } from 'react';
import { Drawer, Button, Form, Input, Select, message } from 'antd';
import * as css from './style/addorEditBranch.modules.less';
import { CheckOutlined } from '@ant-design/icons';
import * as Api from '../../api/branch';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getBranch: Function;
  filter: any;
  match: any;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, filter, getBranch, match } = props;
  const [form] = Form.useForm();
  const [project, setProject] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      getProject();
    }
  }, [visible]);

  const getProject = async () => {
    let result = await Api.projectAllApi();
    const { success, data } = result;
    if (success) {
      setProject(data);
    }
  };
  useEffect(() => {
    if (visible && match) {
      const projectid = Number(match.params.projectId);
      getBranchList(projectid);
    }
  }, [match, visible]);

  const getBranchList = async (projectId: number) => {
    let result = await Api.branchListApi(projectId);
    const { success, data } = result;
    if (success && data) {
      setBranchList(data);
    }
  };

  useEffect(() => {
    if (visible && project && project.length > 0) {
      const projectid = Number(match.params.projectId);
      form.setFieldsValue({ projectId: projectid });
    }
  }, [visible, match, project]);

  const handleAdd = () => {
    form.validateFields().then(values => {
      if (values && !values.outOfDate) {
        addBranch(values);
      }
    });
  };

  const addBranch = async (params: any) => {
    let result = await Api.saveBranchApi(params);
    const { success, data } = result;
    if (success) {
      setVisible(false);
      message.success(data);
      getBranch(filter);
      form.resetFields();
    }
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
          <Select disabled={true}>
            {project &&
              project.length > 0 &&
              project.map(item => {
                return (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item label="branch" name="branchId">
          <Select>
            {branchList &&
              branchList.length > 0 &&
              branchList.map(item => {
                return (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                );
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
