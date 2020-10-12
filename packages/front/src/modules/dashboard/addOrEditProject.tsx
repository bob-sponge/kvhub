import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Form, Input, Select, Modal, message } from 'antd';
import * as css from './style/addOrEditProject.modules.less';
import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as Api from '../../api';
import { defaultDetail, compareObject } from './constant';
const { confirm } = Modal;

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getProjectAll: Function;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, getProjectAll } = props;
  const [form] = Form.useForm();
  const [languages, setLanguages] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(defaultDetail);

  useEffect(() => {
    getLanguages();
  }, []);

  const getLanguages = async () => {
    let result = await Api.languagesApi();
    const { success, data } = result;
    if (success && data) {
      setLanguages(data);
    }
  };

  const onContentChange = (label: string, e: any) => {
    detail[label] = label === 'name' ? e.target.value : e;
    setDetail({ ...detail });
  };

  const addProject = async (params: any) => {
    let result = await Api.addProjectApi(params);
    const { success, data } = result;
    if (success) {
      setVisible(false);
      message.success(data);
      getProjectAll();
      form.resetFields();
    }
  };

  const handleAdd = () => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        let params = {
          name: values.name.trim(),
          referenceId: values.referenceId,
        };
        addProject(params);
      }
    });
  };

  const renderFooter = () => {
    return (
      <div className={css.drawerFooter}>
        <Button onClick={onClose}>Cancel</Button>
        <Button icon={<CheckOutlined />} type="primary" onClick={handleAdd}>
          Submit
        </Button>
      </div>
    );
  };

  const onClose = useCallback(() => {
    let formDetail = {
      name: form.getFieldValue('name'),
      referenceId: form.getFieldValue('referenceId'),
    };
    if (!compareObject(defaultDetail, formDetail)) {
      showPopConfirm(() => {
        setVisible(false);
        form.resetFields();
      });
    } else {
      setVisible(false);
    }
  }, [detail, form]);

  const showPopConfirm = (onPopOk: Function) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Changes have been made. Exit?',
      onOk() {
        onPopOk();
      },
    });
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
      <Form form={form} name="basic" layout="vertical">
        <Form.Item
          label="Project Name"
          name="name"
          rules={[
            { required: true, message: 'Please input your project name!' },
            {
              max: 100,
              message: 'Project name can contain at most 100 characters',
            },
          ]}>
          <Input onChange={e => onContentChange('name', e)} />
        </Form.Item>
        <Form.Item
          label="Reference Language"
          name="referenceId"
          rules={[{ required: true, message: 'Please select reference language!' }]}>
          <Select onChange={e => onContentChange('referenceId', e)}>
            {languages &&
              languages.length > 0 &&
              languages.map(item => {
                return (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddOrEditProject;
