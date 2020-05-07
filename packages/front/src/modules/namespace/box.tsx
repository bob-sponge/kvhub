import React, { useState, useCallback, useEffect } from 'react';
import { Input, Button, Popover } from 'antd';
import { ItemKey } from './constant';
import EditKeyDrawer from './editKeyDrawer';
import * as css from './styles/namespace.modules.less';
import { KeyOutlined, SettingOutlined, SwapRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface LanguageBoxProps {
  keyData: ItemKey;
}

const LanguageBox: React.FC<LanguageBoxProps> = ({ keyData }: LanguageBoxProps) => {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [currentKeyData, setCurrentKeyData] = useState<ItemKey>(keyData);

  const settingContent = useCallback(() => {
    const content = (
      <div>
        <p>Edit Key</p>
        <p>Rename Key</p>
        <p>Delete Key</p>
      </div>
    );
    return content;
  }, []);

  const editKey = useCallback(() => {
    setShowDrawer(true);
  }, []);

  const handleDiscard = useCallback(() => {
    setCurrentKeyData(keyData);
  }, [keyData]);

  const handleSave = useCallback(() => {}, []);

  const handleChange = useCallback(
    e => {
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

  useEffect(() => {
    setCurrentKeyData(keyData);
  }, [keyData]);

  return (
    <>
      <div className={css.box}>
        <div className={css.key}>
          <div onClick={editKey}>
            <KeyOutlined />
            <label className={css.boxTitle}>{currentKeyData ? currentKeyData.keyName : ''}</label>
          </div>
          <Popover placement="bottomRight" content={settingContent} trigger="click">
            <Button className={css.settingIcon} icon={<SettingOutlined />} />
          </Popover>
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
            <div className={css.translate}>{currentKeyData ? currentKeyData.refreLanguageValue.keyValue : ''}</div>
          </div>
          <div className={css.right}>
            <span className={css.label}>{currentKeyData ? currentKeyData.targetLanguageValue.languageName : ''}</span>
            <span>{currentKeyData ? currentKeyData.targetLanguageValue.languageName : ''}</span>
            <div className={css.translate}>
              <TextArea
                value={currentKeyData ? currentKeyData.targetLanguageValue.keyValue : ''}
                onChange={handleChange}
              />
            </div>
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
      <EditKeyDrawer visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
};

export default LanguageBox;
