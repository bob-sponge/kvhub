import React from 'react';
import * as css from './styles/languageItem.modules.less';
import { Button, Progress, Popover, Input } from 'antd';
import { doneColor, processColor, toThousands, getPercent } from './constant';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const LanguageItem = ({ item, index }: any) => {
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

  const AddNamespace = (
    <div className={css.addNamespace}>
      <p className={css.title}>{'Add New Namespace'}</p>
      <Input placeholder={'Namespace Name'} />
      <div className={css.buttonList}>
        <Button>{'Discard'}</Button>
        <Button type="primary">{'Save'}</Button>
      </div>
    </div>
  );

  return (
    <>
      <div className={css.languageItem}>
        <div className={css.languageTitle}>
          <p>
            {item.languageName}
            {index === 0 && <span>{' (Reference Language)'}</span>}
          </p>
          <div className={css.languageIocnList}>
            {/* <Popover content={AddNamespace} trigger="click" placement="bottomRight"> */}
            <Button>
              <DeleteOutlined />
            </Button>
            {/* </Popover> */}
            <Popover content={AddNamespace} trigger="click" placement="bottomRight">
              <Button>
                <PlusOutlined />
              </Button>
            </Popover>
          </div>
        </div>
        {progressRender('large', item.translatedKeys, item.totalKeys)}
        <div className={css.languageNamespacesProgress}>
          {item.namespaceList &&
            item.namespaceList.map((detail: any) => {
              return (
                <div className={css.languageNamespacesProgressItem}>
                  <p className={css.languageNamespacesProgressTitle}>{detail.name}</p>
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
