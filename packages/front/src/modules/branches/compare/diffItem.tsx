import React from 'react';
import * as css from '../style/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';
import CompareDiff from './compareDiff';

interface DiffProps {
  diffData: any;
}

const DiffItem: React.FC<DiffProps> = (props: DiffProps) => {
  const { diffData } = props;
  const { source, target } = diffData;

  return (
    <div className={css.diffPanel}>
      <div className={css.namespace}>{source.namespaceName}</div>
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
                  const targetIndex =
                    target.valueList &&
                    target.valueList.length > 0 &&
                    target.valueList.findIndex((item: any) => item.languageId === list.languageId);
                  return (
                    <div className={css.keyList} key={index}>
                      <div className={css.language}>{list.language}</div>
                      <div className={css.name}>
                        {targetIndex !== -1 &&
                        target.valueList &&
                        target.valueList.length > 0 &&
                        target.valueList[index] ? (
                          <CompareDiff source={target.valueList[index].value} target={list.value} />
                        ) : (
                          <CompareDiff source={''} target={list.value} />
                        )}
                      </div>
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
                  const sourceIndex =
                    source.valueList &&
                    source.valueList.length > 0 &&
                    source.valueList.findIndex((item: any) => item.languageId === list.languageId);
                  return (
                    <div className={css.keyList} key={index}>
                      <div className={css.language}>{list.language}</div>
                      <div className={css.name}>
                        {sourceIndex !== -1 &&
                        source.valueList &&
                        source.valueList.length > 0 &&
                        source.valueList[index] ? (
                          <CompareDiff source={source.valueList[index].value} target={list.value} />
                        ) : (
                          <CompareDiff source={''} target={list.value} />
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
