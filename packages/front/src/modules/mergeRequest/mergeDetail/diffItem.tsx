import React, { useCallback } from 'react';
import * as css from '../styles/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';
import CompareDiff from './compareDiff';
import { Button } from 'antd';

interface DiffItemProps {
  diffData: any;
  mergeList: any[];
  setMergeList: Function;
  diffIndex: any;
}

const DiffItem: React.SFC<DiffItemProps> = (props: DiffItemProps) => {
  const { diffData, mergeList, setMergeList, diffIndex } = props;
  const { source, target, keyActualId, mergeDiffKey } = diffData;

  const onSelect = useCallback(
    (id: any) => {
      if (mergeList && mergeList.length > 0) {
        let index = mergeList.findIndex(item => item.keyActualId === keyActualId);
        mergeList[index].mergeDiffKey = Object.assign({}, mergeList[index].mergeDiffKey, {
          selectBranchId: id,
        });
        setMergeList([...mergeList]);
      }
    },
    [mergeList],
  );

  return (
    <div className={css.diffPanel}>
      <div className={css.namespace}>{target.namespaceName}</div>
      <div className={css.diffWapper}>
        <div className={css.diffItem}>
          {source && source.keyname && (
            <>
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
                            <CompareDiff
                              key={`source${index}${diffIndex}`}
                              source={target.valueList[index].value}
                              target={list.value}
                            />
                          ) : (
                            <CompareDiff key={`source${index}${diffIndex}`} source={''} target={list.value} />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className={css.select}>
                <Button
                  type="primary"
                  ghost={mergeDiffKey.selectBranchId === source.branchId ? false : true}
                  onClick={() => onSelect(source.branchId)}>
                  {mergeDiffKey.selectBranchId === source.branchId ? 'Selected' : 'Select'}
                </Button>
              </div>
            </>
          )}
        </div>
        <div className={css.diffItem}>
          {target && target.keyname && (
            <>
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
                            <CompareDiff
                              key={`target${index}${diffIndex}`}
                              source={source.valueList[index].value}
                              target={list.value}
                            />
                          ) : (
                            <CompareDiff key={`target${index}${diffIndex}`} source={''} target={list.value} />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className={css.select}>
                <Button
                  type="primary"
                  ghost={mergeDiffKey.selectBranchId === target.branchId ? false : true}
                  onClick={() => onSelect(target.branchId)}>
                  {mergeDiffKey.selectBranchId === target.branchId ? 'Selected' : 'Select'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffItem;
