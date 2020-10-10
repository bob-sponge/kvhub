import React, { useState, useCallback } from 'react';
import { Form, Input, Button, message } from 'antd';
import * as css from './style/index.modules.less';
import * as Api from '../../api/user';

const ChangePwd: React.SFC = () => {
  const [form] = Form.useForm();
  const [resetPwd, setResetPwd] = useState<any>({});

  const onContentChange = (label: string) => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        resetPwd[label] = values[label].trim();
        setResetPwd({ ...resetPwd });
      }
    });
  };

  const onSave = useCallback(() => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        let params = Object.assign({}, resetPwd, {
          userId: Number(sessionStorage.getItem('userId')),
          oldPass: values.oldPass,
          newPass: values.newPass,
        });
        reset(params);
      }
    });
  }, [resetPwd]);

  const reset = async (params: any) => {
    let result = await Api.resetPwdApi(params);
    const { success, data } = result;
    if (success) {
      message.success(data);
      form.resetFields();
    }
  };

  const checkValue = (_: any, value: any) => {
    if (!value) {
      return Promise.reject('Please input your new password!');
    } else if (value && value.length > 256) {
      return Promise.reject('Can contain at most 256 characters');
    } else {
      return Promise.resolve();
    }
  };

  return (
    <div className={css.changPwd}>
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
          rules={[
            {
              validator: checkValue,
            },
          ]}>
          <Input onChange={() => onContentChange('newPass')} />
        </Form.Item>
        <Button type="primary" onClick={onSave}>
          Save
        </Button>
      </Form>
    </div>
  );
};

export default ChangePwd;
