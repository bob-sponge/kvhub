import React from 'react';
import * as css from '../../branches/style/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';
import CompareDiff from '../../branches/compare/compareDiff';

interface DiffItemProps {
  diffData: any;
}

const DiffItem: React.SFC<DiffItemProps> = (props: DiffItemProps) => {
  const { diffData } = props;
  const { source, target } = diffData;

  return (
    <div className={css.diffPanel}>
      <div className={css.namespace}>{target.namespaceName}</div>
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
