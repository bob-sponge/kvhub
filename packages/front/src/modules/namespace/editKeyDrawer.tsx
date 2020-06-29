import React, { useState, useEffect, useCallback } from 'react';
import { Input, Popover, Drawer, Form, Col, Row, Button } from 'antd';
import * as css from './styles/namespace.modules.less';
import * as Api from '../../api/namespace';
import { EDIT, ADD } from './constant';
import { FormOutlined } from '@ant-design/icons';
const { TextArea } = Input;

interface EditKeyDrawerProps {
  keyItem: any;
  mode: string;
  onClose: Function;
  visible: boolean;
  branchId: number;
  namespaceId: number;
  languages: any;
  refreshList: Function;
}

const EditKeyDrawer: React.FC<EditKeyDrawerProps> = ({
  keyItem,
  mode,
  onClose,
  visible,
  branchId,
  namespaceId,
  languages,
  refreshList,
}: EditKeyDrawerProps) => {
  const [language, setLanguage] = useState<any>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [currKeyItem, setCurrKeyItem] = useState(keyItem);
  const [form] = Form.useForm();

  const modifyKeyName = useCallback(async () => {
    const data = {
      keyId: currKeyItem.keyId,
      keyName: currKeyItem.keyName,
    };
    await Api.modifyKeyname(data);
    refreshList();
  }, [currKeyItem]);

  const getEditTitle = useCallback(() => {
    let content = (
      <div className={css.modifyKeyName}>
        <p className={css.keyTitle}>{'Rename Key Name'}</p>
        <Input
          value={currKeyItem.keyName}
          onChange={e => {
            const newItem = {
              ...currKeyItem,
              keyName: e.target.value,
            };
            setCurrKeyItem(newItem);
          }}
        />
        <div className={css.buttonList}>
          <Button onClick={() => setPopoverVisible(false)}>{'Discard'}</Button>
          <Button type="primary" onClick={modifyKeyName}>
            {'Save'}
          </Button>
        </div>
      </div>
    );
    let title = (
      <div className={css.editKeyName}>
        <div>{keyItem.keyName}</div>
        <Popover
          onVisibleChange={handleVisibleChange}
          placement="bottomLeft"
          content={content}
          trigger="click"
          visible={popoverVisible}>
          <div className={css.rename}>
            <span className={css.icon}>
              <FormOutlined />
            </span>
            <span className={css.lable}>Rename</span>
          </div>
        </Popover>
      </div>
    );
    return title;
  }, [popoverVisible, currKeyItem]);

  const handleVisibleChange = (isShow: boolean) => {
    setPopoverVisible(isShow);
  };

  const getLanguageInfo = useCallback(async () => {
    if (mode === EDIT) {
      const languageRes = await Api.getLanguagesByKeyId(keyItem.keyId);
      if (languageRes.success) {
        setLanguage(languageRes.data);
      }
    }
    setLanguage(null);
  }, [keyItem, mode]);

  const modifyLanguage = useCallback(() => {
    form.validateFields().then(values => {
      if (mode === ADD) {
        const kv: any = [];
        let keyName = null;
        Object.keys(values).map(key => {
          if (key !== 'keyName') {
            const lang: any = languages.find((t: any) => t.name === key);
            kv.push({
              languageId: lang.id,
              value: values[key],
            });
          } else {
            keyName = values[key];
          }
        });
        if (values) {
          const data = {
            branchId: branchId,
            namespaceId: namespaceId,
            keyId: null,
            keyName: keyName,
            kv: kv,
          };
          Api.addOrEditKeyValue(data);
          onClose();
        }
      } else {
      }
    });
  }, [keyItem]);

  useEffect(() => {
    getLanguageInfo();
  }, []);

  window.console.log('language', language);
  return (
    <div>
      <Drawer
        maskClosable={false}
        title={mode === ADD ? 'Add New Item' : getEditTitle()}
        width={590}
        onClose={() => onClose()}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}>
            <Button onClick={() => onClose()} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={() => modifyLanguage()} type="primary">
              Submit
            </Button>
          </div>
        }>
        <Form form={form} layout="vertical" hideRequiredMark>
          {mode === ADD && (
            <div>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    name={'keyName'}
                    label={
                      <div>
                        <span className={css.keyLabel}>key</span>
                      </div>
                    }
                    rules={[{ required: true, message: 'Please enter key name' }]}>
                    <TextArea />
                  </Form.Item>
                </Col>
              </Row>
              {languages.map((ele: any, index: any) => {
                return (
                  <Row gutter={16} key={index}>
                    <Col span={16}>
                      <Form.Item
                        name={ele.name}
                        label={
                          <div>
                            <span className={css.label}>{ele.name}</span>
                            <span>{ele.name}</span>
                            {index === 0 && <span className={css.refLanguage}>(Reference Language)</span>}
                          </div>
                        }>
                        <TextArea />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              })}
            </div>
          )}
          {mode === EDIT && (
            <div>
              {language &&
                language.value.map((ele: any, index: any) => {
                  return (
                    <Row gutter={16} key={index}>
                      <Col span={16}>
                        <Form.Item
                          name={ele.name}
                          label={
                            <div>
                              <span className={css.label}>{ele.name}</span>
                              <span>{ele.name}</span>
                              {index === 0 && <span className={css.refLanguage}>(Reference Language)</span>}
                            </div>
                          }>
                          <TextArea value={ele.value} />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                })}
            </div>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default EditKeyDrawer;
