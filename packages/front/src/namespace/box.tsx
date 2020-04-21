import React from 'react';
import * as css from './styles/namespace.modules.less';
import { Input } from 'antd';
import { KeyOutlined, SettingOutlined, SwapRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const LanguageBox = () => {
  return (
    <div style={{ width: '50%' }}>
      <div className={css.box}>
        <div className={css.key}>
          <div>
            <KeyOutlined />
            <label className={css.title}>ACTIVITY_LINE_NOT_EXITS</label>
          </div>
          <div className={css.icon} style={{ color: '#627279' }}>
            <SettingOutlined />
          </div>
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
    </div>
  );
};

export default LanguageBox;
