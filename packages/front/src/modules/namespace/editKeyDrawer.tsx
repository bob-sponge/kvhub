import React, { useState, useEffect, useCallback } from 'react';
import { Input, Popover, Drawer, Form, Col, Row, Button, Modal, Popconfirm } from 'antd';
import * as css from './styles/namespace.modules.less';
import * as Api from '../../api/namespace';
import { EDIT, ADD, checkValue, checkMax, defaultKeyDetail } from './constant';
import { ExclamationCircleOutlined, FormOutlined } from '@ant-design/icons';
import { compareObject } from '../dashboard/constant';
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
  onCancle: Function;
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
  onCancle,
}: EditKeyDrawerProps) => {
  const [language, setLanguage] = useState<any>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [currKeyItem, setCurrKeyItem] = useState(keyItem);
  const [errorTips, setErrorTips] = useState({
    show: false,
    tips: '',
  });
  const [currKeyName, setKeyName] = useState(keyItem ? keyItem.keyName : '');
  const [detail, setDetail] = useState<any>({});
  const [defaultEditDetail, setDefaultEditDetail] = useState<any>({});
  const [editDetail, setEditDetail] = useState<any>({});
  const [form] = Form.useForm();

  useEffect(() => {
    getLanguageInfo();
    setDetail(Object.assign({}, defaultKeyDetail));
  }, []);

  const modifyKeyName = useCallback(async () => {
    if (!errorTips.show) {
      const data = {
        keyId: currKeyItem.keyId,
        keyName: currKeyItem.keyName,
      };
      const res = await Api.modifyKeyname(data);
      if (res.success) {
        setKeyName(res.data.name);
        setErrorTips({
          show: false,
          tips: '',
        });
      }
      setPopoverVisible(false);
      refreshList();
      onClose();
    }
  }, [currKeyItem, errorTips]);

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
            if (e.target.value) {
              if (e.target.value.length > 500) {
                setErrorTips({
                  show: true,
                  tips: 'Can contain at most 500 characters',
                });
              } else {
                setErrorTips({
                  show: false,
                  tips: '',
                });
              }
            } else {
              setErrorTips({
                show: true,
                tips: 'Key name can not be null',
              });
            }
          }}
        />
        {errorTips && <label style={{ color: 'red' }}>{errorTips.tips}</label>}
        <div className={css.buttonList}>
          <Button
            onClick={() => {
              setPopoverVisible(false);
            }}>
            {'Discard'}
          </Button>
          <Button type="primary" onClick={modifyKeyName}>
            {'Save'}
          </Button>
        </div>
      </div>
    );
    let title = (
      <div className={css.editKeyName}>
        <div title={currKeyName} className={css.editKeyNameTitle}>
          {currKeyName}
        </div>
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
  }, [popoverVisible, currKeyItem, keyItem, currKeyName, errorTips]);

  const handleVisibleChange = (isShow: boolean) => {
    if (isShow) {
      setCurrKeyItem(keyItem);
      if (errorTips.show) {
        setErrorTips({
          show: false,
          tips: '',
        });
      }
    }
    setPopoverVisible(isShow);
  };

  const getLanguageInfo = useCallback(async () => {
    if (mode === EDIT) {
      const languageRes = await Api.getLanguagesByKeyId(keyItem.keyId);
      if (languageRes.success) {
        const editLanguages: any = [];
        const detailLanguages: any[] = [];
        languages.map((item: any) => {
          const lang = languageRes.data.value.find((t: any) => item.id === t.language_id);
          if (lang) {
            const obj = {
              id: item.id,
              value: lang.value,
              name: item.name,
              referenceLanguage: item.referenceLanguage,
            };
            editLanguages.push(obj);
            detailLanguages.push(obj);
          }
        });
        setDefaultEditDetail([...detailLanguages]);
        setEditDetail([...detailLanguages]);
        setLanguage([...editLanguages]);
      }
    }
  }, [keyItem, mode, languages]);

  const modifyLanguage = useCallback(() => {
    form.validateFields().then(async (values: any) => {
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
          await Api.addOrEditKeyValue(data);
          onClose();
        }
      } else {
        const kv: any = [];
        Object.keys(values).map(key => {
          const lang: any = languages.find((t: any) => t.name === key);
          kv.push({
            languageId: lang.id,
            value: values[key],
          });
        });
        const data = {
          branchId: branchId,
          namespaceId: namespaceId,
          keyId: keyItem.keyId,
          keyName: keyItem.keyName,
          kv: kv,
        };
        await Api.addOrEditKeyValue(data);
        onClose();
      }
    });
  }, [keyItem]);

  const onContentChange = (e: any, flag: string, id?: number) => {
    if (flag === 'keyName') {
      detail[flag] = e.target.value;
    } else {
      const kv: any = [];
      const lang: any = languages.find((t: any) => t.id === id);
      kv.push({
        languageId: lang.id,
        value: e.target.value,
      });
      detail.kv = kv;
    }
    setDetail({ ...detail });
  };

  const onContentEditChange = useCallback(
    (e: any, item?: any) => {
      const index = editDetail.findIndex((t: any) => t.name === item.name);
      if (index !== -1) {
        editDetail[index] = Object.assign({}, editDetail[index], {
          value: e.target.value,
        });
      }
      setEditDetail([...editDetail]);
    },
    [editDetail],
  );

  const onCloseDrawer = useCallback(() => {
    if (!compareObject(defaultKeyDetail, detail)) {
      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        content: 'Changes have been made. Exit?',
        onOk() {
          onCancle();
        },
      });
    } else {
      onCancle();
    }
  }, [detail]);

  const onEditCloseDrawer = useCallback(() => {
    if (!compareObject(defaultEditDetail, editDetail)) {
      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        content: 'Changes have been made. Exit?',
        onOk() {
          onCancle();
        },
      });
    } else {
      onCancle();
    }
  }, [defaultEditDetail, editDetail]);

  const renderCancel = useCallback(() => {
    if (!compareObject(defaultKeyDetail, detail)) {
      return (
        <Popconfirm
          title="Changes have been made. Exit?"
          onConfirm={() => {
            onCancle();
          }}>
          <Button style={{ marginRight: 8 }}>Cancel</Button>
        </Popconfirm>
      );
    } else {
      return (
        <Button style={{ marginRight: 8 }} onClick={() => onCancle()}>
          Cancel
        </Button>
      );
    }
  }, [detail]);

  const renderEditCancel = useCallback(() => {
    if (!compareObject(defaultEditDetail, editDetail)) {
      return (
        <Popconfirm
          title="Changes have been made. Exit?"
          onConfirm={() => {
            onCancle();
          }}>
          <Button style={{ marginRight: 8 }}>Cancel</Button>
        </Popconfirm>
      );
    } else {
      return (
        <Button style={{ marginRight: 8 }} onClick={() => onCancle()}>
          Cancel
        </Button>
      );
    }
  }, [defaultEditDetail, editDetail]);

  window.console.log(language, languages);

  return (
    <div>
      <Drawer
        maskClosable={false}
        title={mode === ADD ? 'Add New Item' : getEditTitle()}
        width={590}
        onClose={mode === ADD ? onCloseDrawer : onEditCloseDrawer}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}>
            {mode === ADD ? renderCancel() : renderEditCancel()}
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
                    rules={checkValue('key')}>
                    <TextArea onChange={e => onContentChange(e, 'keyName')} />
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
                          <div className="reference">
                            <span className={css.label}>{ele.name}</span>
                            <span>{ele.name}</span>
                            {ele.referenceLanguage && <span className={css.refLanguage}>(Reference Language)</span>}
                          </div>
                        }
                        rules={ele.referenceLanguage ? checkValue('reference') : checkMax}>
                        <TextArea onChange={e => onContentChange(e, ele.name, ele.id)} />
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
                language.map((ele: any, index: any) => {
                  return (
                    <Row gutter={16} key={index}>
                      <Col span={16}>
                        <Form.Item
                          initialValue={ele.value}
                          name={ele.name}
                          label={
                            <div className="reference">
                              <span className={css.label}>{ele.name}</span>
                              <span>{ele.name}</span>
                              {ele.referenceLanguage && <span className={css.refLanguage}>(Reference Language)</span>}
                            </div>
                          }
                          rules={ele.referenceLanguage ? checkValue('reference') : checkMax}>
                          <TextArea value={ele.value} onChange={e => onContentEditChange(e, ele)} />
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
