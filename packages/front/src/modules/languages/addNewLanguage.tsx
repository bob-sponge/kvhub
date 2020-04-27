import React, { useState } from 'react';
import { Drawer, Form, Button, Input, Select } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import * as css from './styles/addNewLanguage.modules.less';

const Option = Select.Option;

interface InjectedProps {
  visible: boolean;
  showAdd: Function;
}

const AddNewLanguage = ({ visible, showAdd }: InjectedProps) => {
  const [form] = Form.useForm();
  const [namespaceList, setNamespaceList] = useState([
    {
      key: 'namespace1',
      name: 'namespace - 1',
    },
  ]);

  const addNamespaceList = () => {
    const list = Object.assign([], namespaceList);
    list.push({
      key: `namespace${namespaceList.length + 1}`,
      name: `namespace - ${namespaceList.length + 1}`,
    });
    setNamespaceList(list);
  };

  const deleteNamespaceList = (index: number) => {
    const list = Object.assign([], namespaceList);
    list.splice(index);
    setNamespaceList(list);
  };

  return (
    <>
      <Drawer
        title="Add New Language"
        width={590}
        onClose={() => showAdd()}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        headerStyle={{ display: 'none' }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}>
            <Button onClick={() => showAdd()} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={() => showAdd()} type="primary">
              Submit
            </Button>
          </div>
        }>
        <Form layout="vertical" form={form} className={css.main}>
          <div className={css.title}>
            <p>{'Add New Language'}</p>
            <CloseOutlined className={css.icon} />
          </div>
          <Form.Item name="Language" label="Language" rules={[{ required: true, message: 'Please select language' }]}>
            <Select placeholder="Please select language">
              <Option value="en">English</Option>
              <Option value="zh">中文</Option>
            </Select>
          </Form.Item>

          <div className={css.title}>
            <p>{'Namespace'}</p>
          </div>

          {namespaceList.map((item, index) => {
            return (
              <Form.Item name={item.key} label={item.name}>
                <div className={css.namespaceForm}>
                  <Input placeholder="Please enter namespace" />
                  {namespaceList.length > 1 && (
                    <CloseOutlined onClick={() => deleteNamespaceList(index)} className={css.icon} />
                  )}
                </div>
              </Form.Item>
            );
          })}
        </Form>
        <Button onClick={addNamespaceList}>
          <PlusOutlined />
          {'Add Namespace'}
        </Button>
      </Drawer>
    </>
  );
};

export default AddNewLanguage;
