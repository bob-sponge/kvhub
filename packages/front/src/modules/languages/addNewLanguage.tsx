import React, { useState, useCallback, useEffect } from 'react';
import { Drawer, Form, Button, Select } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { languagesAllApi } from '../../api/languages';
import * as css from './styles/addNewLanguage.modules.less';

const Option = Select.Option;

interface InjectedProps {
  visible: boolean;
  changeModal: Function;
}

const AddNewLanguage = ({ visible, changeModal }: InjectedProps) => {
  const [form] = Form.useForm();
  const [languageList, setLanguageList] = useState([]);
  // const [namespaceList, setNamespaceList] = useState([]);

  const languagesAll = useCallback(async () => {
    const res = await languagesAllApi();
    if (res.data) {
      setLanguageList(res.data);
    }
  }, []);

  useEffect(() => {
    languagesAll();
  }, [languagesAll]);

  // const addNamespaceList = () => {
  //   const list: any = Object.assign([], namespaceList);
  //   list.push({
  //     key: `namespace${namespaceList.length + 1}`,
  //     name: `namespace - ${namespaceList.length + 1}`,
  //   });
  //   setNamespaceList(list);
  // };

  // const deleteNamespaceList = (index: number) => {
  //   const list = Object.assign([], namespaceList);
  //   list.splice(index);
  //   setNamespaceList(list);
  // };

  const addLanguage = () => {
    form.validateFields().then(values => {
      window.console.log(values);
      if (values && !values.outOfDate) {
        changeModal({
          languageId: values.Language,
        });
      }
    });
  };

  const renderFooter = () => {
    return (
      <div
        style={{
          textAlign: 'right',
        }}>
        <Button onClick={() => changeModal()} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button icon={<CheckOutlined />} onClick={() => addLanguage()} type="primary">
          Submit
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      title="Add New Language"
      placement="right"
      width={590}
      onClose={() => changeModal()}
      visible={visible}
      destroyOnClose={true}
      closable={true}
      // bodyStyle={{ paddingBottom: 80 }}
      // headerStyle={{ display: 'none' }}
      footer={renderFooter()}>
      <Form layout="vertical" form={form} className={css.main}>
        {/* <div className={css.title}>
            <p>{'Add New Language'}</p>
            <CloseOutlined className={css.icon} />
          </div> */}
        <Form.Item name="Language" label="Language" rules={[{ required: true, message: 'Please select language' }]}>
          <Select placeholder="Please select language">
            {languageList &&
              languageList.map((item: any) => {
                return (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>

        {/* <div className={css.title}>
            <p>{'Namespace'}</p>
          </div> */}

        {/* {namespaceList &&
            namespaceList.map((item: any, index) => {
              return (
                <Form.Item name={item.key} label={item.name} key={item.key}>
                  <div className={css.namespaceForm}>
                    <Input placeholder="Please enter namespace" />
                    {namespaceList.length > 1 && (
                      <CloseOutlined onClick={() => deleteNamespaceList(index)} className={css.icon} />
                    )}
                  </div>
                </Form.Item>
              );
            })} */}
      </Form>
      {/* <Button onClick={addNamespaceList}>
          <PlusOutlined />
          {'Add Namespace'}
        </Button> */}
    </Drawer>
  );
};

export default AddNewLanguage;
