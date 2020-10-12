import React, { useState, useCallback, useEffect } from 'react';
import { Drawer, Form, Button, Select, Modal, Popconfirm } from 'antd';
import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { languagesAllApi } from '../../api/languages';
import * as css from './styles/addNewLanguage.modules.less';
import { defaultLanguage } from './constant';
import { compareObject } from '../dashboard/constant';

const { confirm } = Modal;

const Option = Select.Option;

interface InjectedProps {
  visible: boolean;
  changeModal: Function;
  setVisible: Function;
}

const AddNewLanguage = (props: InjectedProps) => {
  const [form] = Form.useForm();
  const { setVisible, visible, changeModal } = props;
  const [languageList, setLanguageList] = useState([]);
  const [detail, setDetail] = useState({});

  useEffect(() => {
    setDetail(Object.assign({}, defaultLanguage));
  }, []);

  const languagesAll = useCallback(async () => {
    const res = await languagesAllApi();
    if (res.data) {
      setLanguageList(res.data);
    }
  }, []);

  useEffect(() => {
    languagesAll();
  }, [languagesAll]);

  const addLanguage = () => {
    form.validateFields().then(values => {
      if (values && !values.outOfDate) {
        closeModal({
          languageId: values.Language,
        });
      }
    });
  };

  const closeModal = (values?: any) => {
    form.resetFields();
    changeModal(values);
    setVisible(false);
    setDetail({});
  };

  const handleSelect = (value: any) => {
    setDetail({
      languageId: value,
    });
  };

  const renderFooter = () => {
    return (
      <div
        style={{
          textAlign: 'right',
        }}>
        {renderCancel()}
        <Button icon={<CheckOutlined />} onClick={() => addLanguage()} type="primary">
          Submit
        </Button>
      </div>
    );
  };

  const renderCancel = useCallback(() => {
    if (!compareObject(defaultLanguage, detail)) {
      return (
        <Popconfirm
          title="Changes have been made. Exit?"
          onConfirm={() => {
            closeModal();
          }}>
          <Button style={{ marginRight: 8 }}>Cancel</Button>
        </Popconfirm>
      );
    } else {
      return (
        <Button style={{ marginRight: 8 }} onClick={() => closeModal()}>
          Cancel
        </Button>
      );
    }
  }, [detail]);

  const onClose = useCallback(() => {
    if (!compareObject(defaultLanguage, detail)) {
      confirm({
        icon: <ExclamationCircleOutlined />,
        content: 'Changes have been made. Exit?',
        onOk() {
          closeModal();
        },
      });
    } else {
      closeModal();
    }
  }, [detail]);

  return (
    <Drawer
      title="Add New Language"
      placement="right"
      width={590}
      onClose={onClose}
      visible={visible}
      destroyOnClose={true}
      closable={true}
      footer={renderFooter()}>
      <Form layout="vertical" form={form} className={css.main}>
        <Form.Item name="Language" label="Language" rules={[{ required: true, message: 'Please select language' }]}>
          <Select placeholder="Please select language" onChange={handleSelect}>
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
      </Form>
    </Drawer>
  );
};

export default AddNewLanguage;
