import React, { useState } from 'react';
import * as css from './styles/languageItem.modules.less';
import { Button, Progress, Popover, Input, message, Popconfirm, Form } from 'antd';
import { doneColor, processColor, toThousands, getPercent, Rule } from './constant';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import * as Api from '../../api/languages';
import { history } from '../../history';

const LanguageItem = ({ item, index, projectView, branchId, pid }: any) => {
  const [form] = Form.useForm();

  const [visible, setVisible] = useState(false);
  // const [addNamespaceName, setAddNamespaceName] = useState('');

  const handleVisibleChange = (isShow: boolean) => {
    setVisible(isShow);
    if (!isShow) {
      form.resetFields();
    }
  };

  const namespaceSave = async () => {
    form.validateFields().then(async values => {
      if (values && !values.outOfDate) {
        const detail = { name: values.name.trim(), projectId: pid, type: 'private' };
        const res = await Api.namespaceSaveApi(detail);
        projectView(branchId);
        setVisible(false);
        form.resetFields();
        message.success(res && res.data);
      }
    });
  };

  const progressRender = (size: string, translatedKeys: number, totalKeys: number) => {
    return (
      <div className={css.languageProgress}>
        <div className={css.languageProgressText}>
          <p
            className={css.languageProgressTextValue}
            style={{
              fontSize: size === 'small' ? '24px' : '32px',
              color: getPercent(translatedKeys, totalKeys).percent === 100 ? doneColor : processColor,
            }}>
            {toThousands(translatedKeys)} <span>{` / ${toThousands(totalKeys)} Keys`}</span>
          </p>
          <p
            className={css.languageProgressTextStatus}
            style={{
              color: getPercent(translatedKeys, totalKeys).percent === 100 ? doneColor : processColor,
            }}>
            {getPercent(translatedKeys, totalKeys).text}
          </p>
        </div>
        <Progress
          percent={getPercent(translatedKeys, totalKeys).percent}
          showInfo={false}
          strokeColor={getPercent(translatedKeys, totalKeys).percent === 100 ? doneColor : processColor}
        />
      </div>
    );
  };

  const deleteLanguage = async () => {
    const res = await Api.projectLanguageDeleteApi(item.id);
    projectView(branchId);
    if (res.success) {
      message.success('Delete successfully!');
    }
  };

  const AddNamespace = (
    <div className={css.addNamespace}>
      <p className={css.title}>{'Add New Namespace'}</p>
      <Form form={form} name="basic" layout="horizontal">
        <Form.Item label="name" name="name" rules={Rule()}>
          <Input />
        </Form.Item>
      </Form>
      <div className={css.buttonList}>
        <Button onClick={() => handleVisibleChange(false)}>{'Discard'}</Button>
        <Button type="primary" onClick={namespaceSave}>
          {'Save'}
        </Button>
      </div>
    </div>
  );

  const handleJump = (id: number, languageId: number, name: string) => {
    const path = window.location.pathname.split('/');
    if (process.env.NODE_ENV === 'production') {
      history.push(`/namespace/${encodeURIComponent(name)}/${path[3]}/${id}/${languageId}`);
    } else {
      history.push(`/namespace/${encodeURIComponent(name)}/${path[2]}/${id}/${languageId}`);
    }
  };

  return (
    <>
      <div className={css.languageItem}>
        <div className={css.languageTitle}>
          <p>
            {item.languageName}
            {index === 0 && <span>{' (Reference Language)'}</span>}
          </p>
          <div className={css.languageIocnList}>
            {localStorage.getItem('userType') === '0' && (
              <Popconfirm
                title="Are you sure to delete the language？"
                okText="Yes"
                cancelText="No"
                onConfirm={deleteLanguage}>
                <Button>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            )}
            <Popover
              content={AddNamespace}
              trigger="click"
              placement="bottomRight"
              visible={visible}
              onVisibleChange={handleVisibleChange}>
              <Button>
                <PlusOutlined />
              </Button>
            </Popover>
          </div>
        </div>
        {progressRender('large', item.translatedKeys, item.totalKeys)}
        <div className={css.languageNamespacesProgress}>
          {item.namespaceList &&
            item.namespaceList.map((detail: any, i: number) => {
              return (
                <div
                  className={css.languageNamespacesProgressItem}
                  key={`${item.id}${i}`}
                  onClick={() => handleJump(detail.id, item.languageId, detail.name)}>
                  <p style={{ WebkitBoxOrient: 'vertical' }} className={css.languageNamespacesProgressTitle}>
                    {detail.name}
                  </p>
                  {progressRender('small', detail.translatedKeys, detail.totalKeys)}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default LanguageItem;
