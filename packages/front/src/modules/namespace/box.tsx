import React, { useState, useCallback } from 'react';
import { Input, Button, Popover } from 'antd';
import EditKeyDrawer from './editKeyDrawer';
import * as css from './styles/namespace.modules.less';
import { KeyOutlined, SettingOutlined, SwapRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const LanguageBox: React.FC = () => {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

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

  return (
    <>
      <div className={css.box}>
        <div className={css.key}>
          <div onClick={editKey}>
            <KeyOutlined />
            <label className={css.boxTitle}>ACTIVITY_LINE_NOT_EXITS</label>
          </div>
          <Popover placement="bottomRight" content={settingContent} trigger="click">
            <Button className={css.settingIcon} icon={<SettingOutlined />} />
          </Popover>
        </div>
        <div className={css.language}>
          <div className={css.left}>
            <div className={css.value}>
              <div>
                <span className={css.label}>EN</span>
                <span>English</span>
                <span className={css.refLanguage}>(Reference Language)</span>
              </div>
              <div>
                <SwapRightOutlined />
              </div>
            </div>
            <div className={css.translate}>Open Industrial Intelligent Monitoring for you</div>
          </div>
          <div className={css.right}>
            <span className={css.label}>DE</span>
            <span>Deutsch</span>
            <div className={css.translate}>
              <TextArea />
            </div>
          </div>
        </div>
      </div>
      <EditKeyDrawer visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
};

export default LanguageBox;
