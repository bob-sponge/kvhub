import React, { useCallback, useState } from 'react';
import { Input, Form, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import * as css from '../src/style/login.modules.less';
const titleLogo = require('./resource/logo_smz.png');
const i18nLogo = require('./resource/logo-i18n.png');

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [showError, setErrorTips] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = useCallback(() => {
    form.validateFields().then(async (values: any) => {
      // eslint-disable-next-line no-console
      console.log(values);
      setErrorTips(true);
    });
  }, []);

  const handleChange = (type: string) => {
    setErrorTips(false);
    // eslint-disable-next-line no-console
    console.log('type', type);
  };

  return (
    <>
      <img className={css.logo} src={titleLogo}></img>
      <div className={css.loginPage}>
        <div className={css.loginForm}>
          <div className={css.i18N}>
            <img className={css.i18NLogo} src={i18nLogo}></img>
          </div>
          <div className={css.label}>INTERNATIONALIZATION</div>
          <Form form={form} layout="vertical" hideRequiredMark>
            <div style={{ position: 'relative' }}>
              <Form.Item name={'username'} rules={[{ required: true, message: 'Please enter user name' }]}>
                <Input placeholder={'Username'} prefix={<UserOutlined />} onChange={() => handleChange('usernam')} />
              </Form.Item>
              <Form.Item name={'password'} rules={[{ required: true, message: 'Please enter password' }]}>
                <Input
                  placeholder={'Password'}
                  prefix={<LockOutlined />}
                  type="password"
                  onChange={() => handleChange('password')}
                />
              </Form.Item>
              {showError && <div className={css.apiTips}>Wrong username or password, please login again!</div>}
            </div>
          </Form>
          <div className={css.loginBtn}>
            <Button onClick={handleSubmit} type="primary">
              Login
            </Button>
          </div>
        </div>
        <div className={css.footer}>© Siemens AG, 2009 - 2020 All Rights Reserved</div>
      </div>
    </>
  );
};

export default Login;
