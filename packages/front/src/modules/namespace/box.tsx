import React, { useState, useCallback, useEffect } from 'react';
import { Input, Button, Popover } from 'antd';
import { ItemKey, ModifyKeyReq, EDIT, DELETE } from './constant';
import * as Api from '../../api/namespace';
import * as css from './styles/namespace.modules.less';
import { KeyOutlined, SettingOutlined, SwapRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface LanguageBoxProps {
  keyData: ItemKey;
  branchId: number;
  refreshList: Function;
  setShowDrawer: Function;
}

const LanguageBox: React.FC<LanguageBoxProps> = ({
  keyData,
  branchId,
  refreshList,
  setShowDrawer,
}: LanguageBoxProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [currentKeyData, setCurrentKeyData] = useState<ItemKey>(keyData);
  const [errorTips, setErrorTips] = useState({
    show: true,
    tips: '',
  });
  const handleKeyOperate = useCallback(
    async flag => {
      switch (flag) {
        case EDIT:
          setShowDrawer(EDIT, true, currentKeyData);
          break;
        case DELETE:
          setShowDrawer(DELETE, false, currentKeyData);
          setVisible(false);
          break;
        default:
      }
    },
    [currentKeyData],
  );

  const settingContent = useCallback(() => {
    const content = (
      <div onMouseLeave={() => setVisible(false)}>
        <p className={css.settingOperate} onClick={() => handleKeyOperate(EDIT)}>
          Edit Key
        </p>
        <p className={css.settingOperate} onClick={() => handleKeyOperate(DELETE)}>
          Delete Key
        </p>
      </div>
    );
    return content;
  }, [handleKeyOperate]);

  const handleDiscard = useCallback(() => {
    setCurrentKeyData(keyData);
    if (errorTips.show) {
      setErrorTips({
        show: false,
        tips: '',
      });
    }
  }, [keyData, errorTips]);

  const handleSave = useCallback(async () => {
    if (!errorTips.show) {
      const targetLanguageValue = currentKeyData.targetLanguageValue;
      const modifyKeyReq: ModifyKeyReq = {
        keyvalue: targetLanguageValue.keyValue,
        valueId: targetLanguageValue.valueId,
      };
      const res: any = await Api.modifyValue(
        branchId,
        targetLanguageValue.languageId,
        currentKeyData.keyId,
        modifyKeyReq,
      );
      if (res.statusCode === 0) {
        refreshList();
      }
    }
  }, [currentKeyData, errorTips]);

  const handleChange = useCallback(
    e => {
      if (e.target.value && e.target.value.length > 500) {
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
      setCurrentKeyData({
        ...currentKeyData,
        targetLanguageValue: {
          ...currentKeyData.targetLanguageValue,
          keyValue: e.target.value,
        },
      });
      e.preventDefault();
    },
    [currentKeyData],
  );

  const handleVisibleChange = (isShow: boolean) => {
    setVisible(isShow);
  };

  useEffect(() => {
    setCurrentKeyData(keyData);
  }, [keyData]);

  return (
    <>
      <div className={css.box}>
        <div className={css.key}>
          <div style={{ display: 'flex', width: '94%' }}>
            <KeyOutlined />
            <div title={currentKeyData ? currentKeyData.keyName : ''} className={css.boxTitle}>
              {currentKeyData ? currentKeyData.keyName : ''}
            </div>
          </div>
          {currentKeyData.branchId === branchId ? (
            <Popover
              placement="bottomRight"
              onVisibleChange={handleVisibleChange}
              visible={visible}
              trigger="click"
              content={settingContent}>
              <div onClick={() => setVisible(true)}>
                <Button className={css.settingIcon} icon={<SettingOutlined />} />
              </div>
            </Popover>
          ) : (
            <Button disabled={true} className={css.settingIcon} icon={<SettingOutlined />} />
          )}
        </div>
        <div className={css.language}>
          <div className={css.left}>
            <div className={css.value}>
              <div>
                <span className={css.label}>
                  {currentKeyData ? currentKeyData.refreLanguageValue.languageName : ''}
                </span>
                <span>{currentKeyData ? currentKeyData.refreLanguageValue.languageName : ''}</span>
                <span className={css.refLanguage}>(Reference Language)</span>
              </div>
              <div>
                <SwapRightOutlined />
              </div>
            </div>
            <div title={currentKeyData ? currentKeyData.refreLanguageValue.keyValue : ''} className={css.translate}>
              {currentKeyData ? currentKeyData.refreLanguageValue.keyValue : ''}
            </div>
          </div>
          <div className={css.middle} />
          <div className={css.right}>
            <span className={css.label}>{currentKeyData ? currentKeyData.targetLanguageValue.languageName : ''}</span>
            <span>{currentKeyData ? currentKeyData.targetLanguageValue.languageName : ''}</span>
            <div className={css.translate}>
              <TextArea
                value={currentKeyData ? currentKeyData.targetLanguageValue.keyValue : ''}
                onChange={handleChange}
              />
            </div>
            {errorTips.show && <div style={{ color: 'red' }}>{errorTips.tips}</div>}
          </div>
        </div>
        {keyData.targetLanguageValue.keyValue !== currentKeyData.targetLanguageValue.keyValue && (
          <div className={css.operationBtn}>
            <Button className={css.discard} onClick={handleDiscard}>
              Discard
            </Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageBox;
