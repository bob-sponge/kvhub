import React, { useCallback } from 'react';
import { Input, Form, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import * as css from '../src/style/login.modules.less';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [form] = Form.useForm();

  const handleSubmit = useCallback(() => {
    form.validateFields().then(async (values: any) => {
      // eslint-disable-next-line no-console
      console.log(values);
    });
  }, []);

  return (
    <>
      <div className={css.loginPage}>
        <div className={css.loginForm}>
          <Form form={form} layout="vertical" hideRequiredMark>
            <div>
              <Form.Item name={'username'} rules={[{ required: true, message: 'Please enter user name' }]}>
                <Input placeholder={'Username'} prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name={'password'} rules={[{ required: true, message: 'Please enter password' }]}>
                <Input placeholder={'Password'} prefix={<LockOutlined />} type="password" />
              </Form.Item>
            </div>
          </Form>
          <div>
            <Button onClick={handleSubmit} type="primary">
              Login
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
