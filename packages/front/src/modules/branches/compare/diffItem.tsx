import React, { useState, useEffect } from 'react';
import * as css from '../style/compare.modules.less';
import { KeyOutlined } from '@ant-design/icons';
import Diff from './diff';

interface DiffProps {
  diffData: any;
}

const DiffItem: React.SFC<DiffProps> = (props: DiffProps) => {
  const { diffData } = props;
  const [source, setSource] = useState<any[]>([]);
  const [desination, setDesination] = useState<any[]>([]);
  useEffect(() => {
    setSource(diffData.source.keys);
    setDesination(diffData.target.keys);
  }, [diffData]);

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
                      <div className={css.name}>
                        <Diff orignal={source[i].values[index].value} target={list.value} />
                      </div>
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
