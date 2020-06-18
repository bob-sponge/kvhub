import React, { useState, useEffect } from 'react';
import * as css from '../style/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';

interface DiffProps {
  diffData: any[];
}

const DiffItem: React.SFC<DiffProps> = (props: DiffProps) => {
  const { diffData } = props;
  const [source, setSource] = useState<any[]>([]);
  const [desination, setDesination] = useState<any[]>([]);
  useEffect(() => {
    setSource(diffData[0].keys);
    setDesination(diffData[1].keys);
  }, [diffData]);

  const renderCompare = (orignal: string, diff: string) => {
    let newSource = orignal;
    let newDiff = diff;

    if (orignal.length < diff.length) {
      newDiff = diff.substring(0, orignal.length);
    }
    if (orignal.length > diff.length) {
      newSource = orignal.substring(0, diff.length);
    }
    return addHighLight(newSource, newDiff, diff);
  };

  const addHighLight = (newSource: string, newDiff: string, diff: string) => {
    let diffIndex = [];
    for (let i = 0; i < newDiff.length; i++) {
      if (newSource[i] !== newDiff[i]) {
        diffIndex.push(i);
      }
    }
    const diffs =
      diffIndex.length >= 0 &&
      diffIndex.map((item: any) => {
        const matchs = diff.match(diff[item]);
        if (matchs) {
          return [<span style={{ color: '#43BDE0' }}>{diff[item]}</span>];
        } else {
          return [diff[item]];
        }
      });
    return diffs;
  };

  return (
    <div className={css.diffWapper}>
      <div className={css.diffItem}>
        {source &&
          source.length > 0 &&
          source.map((item: any, i: number) => {
            return (
              <div className={css.itemList} key={i}>
                <div className={css.title}>
                  <KeyOutlined />
                  <span>{item.name}</span>
                </div>
                {item.values.map((list: any, index: number) => {
                  return (
                    <div className={css.keyList} key={index}>
                      <div className={css.language}>{list.language}</div>
                      <div className={css.name}>{list.value}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
      <div className={css.diffItem}>
        {desination &&
          desination.length > 0 &&
          desination.map((item: any, i: number) => {
            return (
              <div className={css.itemList} key={i}>
                <div className={css.title}>
                  <KeyOutlined />
                  <span>{item.name}</span>
                </div>
                {item.values.map((list: any, index: number) => {
                  return (
                    <div className={css.keyList} key={index}>
                      <div className={css.language}>{list.language}</div>
                      <div className={css.name}>{renderCompare(source[i].values[index].value, list.value)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default DiffItem;
