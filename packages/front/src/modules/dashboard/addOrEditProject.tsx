import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Form, Input, Select, message, Modal } from 'antd';
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

  const onContentChange = (label: string) => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        detail[label] = label === 'name' ? values[label].trim() : values[label];
        setDetail({ ...detail });
      }
    });
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

  const checkProjectName = (_rule: any, value: any) => {
    if (value && value.length <= 100) {
      return Promise.resolve();
    }
    return Promise.reject('Project name can contain at most 100 characters');
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
          rules={[{ required: true, message: 'Please input your project name!' }, { validator: checkProjectName }]}>
          <Input onChange={() => onContentChange('name')} />
        </Form.Item>
        <Form.Item
          label="Reference Language"
          name="referenceId"
          rules={[{ required: true, message: 'Please select reference language!' }]}>
          <Select onChange={() => onContentChange('referenceId')}>
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
