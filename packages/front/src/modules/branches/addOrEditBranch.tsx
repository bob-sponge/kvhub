import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Form, Input, Select, message, Modal, Popconfirm } from 'antd';
import * as css from './style/addorEditBranch.modules.less';
import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as Api from '../../api/branch';
import { compareObject } from '../dashboard/constant';
import { defaultDetail } from './constant';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getBranch: Function;
  filter: any;
  match: any;
}

const AddOrEditProject: React.FC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, filter, getBranch, match } = props;
  const [form] = Form.useForm();
  const [project, setProject] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<any>(defaultDetail);
  const [branchDetail, setBranchDetail] = useState<any>(defaultDetail);

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
      let selectBranch = data.filter((item: any) => item.master)[0];
      form.setFieldsValue({ branchId: selectBranch.id });
      defaultBranch.branchId = selectBranch.id;
      setDefaultBranch({ ...defaultBranch });
      branchDetail.branchId = selectBranch.id;
      setBranchDetail({ ...branchDetail });
    }
  };

  useEffect(() => {
    if (visible && project && project.length > 0) {
      const projectid = Number(match.params.projectId);
      form.setFieldsValue({ projectId: projectid });
      defaultBranch.projectId = projectid;
      setDefaultBranch({ ...defaultBranch });
      branchDetail.projectId = projectid;
      setBranchDetail({ ...branchDetail });
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
      onClose();
    }
  };

  const renderFooter = () => {
    return (
      <div className={css.drawerFooter}>
        {renderCancel()}
        <Button icon={<CheckOutlined />} type="primary" onClick={handleAdd}>
          Submit
        </Button>
      </div>
    );
  };

  const renderCancel = useCallback(() => {
    if (!compareObject(defaultBranch, branchDetail)) {
      return (
        <Popconfirm
          title="Changes have been made. Exit?"
          onConfirm={() => {
            onClose();
          }}>
          <Button>Cancel</Button>
        </Popconfirm>
      );
    } else {
      return <Button onClick={() => onClose()}>Cancel</Button>;
    }
  }, [branchDetail, defaultBranch]);

  const onClose = () => {
    setVisible(false);
    form.resetFields();
    setDefaultBranch({});
    setBranchDetail({});
  };

  const onCloseDrawer = useCallback(() => {
    if (!compareObject(defaultBranch, branchDetail)) {
      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        content: 'Changes have been made. Exit?',
        onOk() {
          onClose();
        },
      });
    } else {
      onClose();
    }
  }, [branchDetail, defaultBranch]);

  const onSelect = (flag: string, value: any) => {
    if (flag === 'name') {
      branchDetail[flag] = value.target.value;
      setBranchDetail({ ...branchDetail });
    } else {
      branchDetail[flag] = value;
      setBranchDetail({ ...branchDetail });
    }
  };

  return (
    <Drawer
      title="Create Branch"
      placement="right"
      closable={true}
      onClose={onCloseDrawer}
      visible={visible}
      width={590}
      destroyOnClose={true}
      className={css.addProjectDrawer}
      footer={renderFooter()}>
      <Form form={form} name="basic" layout="vertical" initialValues={{ remember: true }}>
        <Form.Item label="project" name="projectId" rules={[{ required: true, message: 'Please select project!' }]}>
          <Select disabled={true} onChange={value => onSelect('projectId', value)}>
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
          <Select onChange={value => onSelect('branchId', value)}>
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
        <Form.Item
          label="Branch Name"
          name="name"
          rules={[
            { required: true, message: 'Please input Branch Name!' },
            {
              max: 100,
              message: 'Branch name can contain at most 100 characters',
            },
          ]}>
          <Input onChange={value => onSelect('name', value)} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddOrEditProject;
