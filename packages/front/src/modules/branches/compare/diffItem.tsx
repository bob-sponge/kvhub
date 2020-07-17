import React from 'react';
import * as css from '../style/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';
import CompareDiff from './compareDiff';

interface DiffProps {
  diffData: any;
  isChange: boolean;
}

const DiffItem: React.SFC<DiffProps> = (props: DiffProps) => {
  const { diffData, isChange } = props;
  const { source, target } = diffData;

  return (
    <div className={css.diffPanel}>
      <div className={css.namespace}>{isChange ? target.namespaceName : source.namespaceName}</div>
      <div className={css.diffWapper}>
        <div className={css.diffItem}>
          {source && source.keyname && (
            <div className={css.itemList}>
              <div className={css.title}>
                <KeyOutlined />
                <span>{source.keyname}</span>
              </div>
              {source.valueList &&
                source.valueList.length > 0 &&
                source.valueList.map((list: any, index: number) => {
                  return (
                    <div className={css.keyList} key={index}>
                      <div className={css.language}>{list.language}</div>
                      <div className={css.name}>{list.value}</div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <div className={css.diffItem}>
          {target && target.keyname && (
            <div className={css.itemList}>
              <div className={css.title}>
                <KeyOutlined />
                <span>{target.keyname}</span>
              </div>
              {target.valueList &&
                target.valueList.length > 0 &&
                target.valueList.map((list: any, index: number) => {
                  const sourceIndex = source.valueList.findIndex((item: any) => item.languageId === list.languageId);
                  return (
                    <div className={css.keyList} key={index}>
                      <div className={css.language}>{list.language}</div>
                      <div className={css.name}>
                        {sourceIndex !== -1 ? (
                          <CompareDiff orignal={source.valueList[index].value} target={list.value} />
                        ) : (
                          <CompareDiff orignal={''} target={list.value} />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffItem;
