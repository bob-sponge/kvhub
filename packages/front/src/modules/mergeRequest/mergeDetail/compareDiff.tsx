import React from 'react';
import * as css from '../styles/index.modules.less';

interface CompareDiffProps {
  source: string;
  target: string;
}

const CompareDiff: React.SFC<CompareDiffProps> = (props: CompareDiffProps) => {
  const { source, target } = props;

  const handleHighlight = () => {
    let items: any[] = [];
    if (source === '' && target) {
      // 情况1 源数据不存在只存在目标数据
      items = addHighlight(target);
    } else if (source && target) {
      // 情况2 源数据存在目标数据
      if (source.length < target.length) {
        let newItems = [];
        const part1 = target.substring(0, source.length);
        const part2 = target.substring(source.length, target.length);
        for (let i = 0; i < part1.length; i++) {
          if (source[i] === part1[i]) {
            newItems.push(part1[i]);
          } else {
            newItems.push([<span className={css.highlight}>{part1[i]}</span>]);
          }
        }
        let otherItem = addHighlight(part2);
        items = newItems.concat(otherItem);
      } else if (source.length >= target.length) {
        let newItems = [];
        for (let i = 0; i < target.length; i++) {
          if (source[i] === target[i]) {
            newItems.push(target[i]);
          } else {
            newItems.push([<span className={css.highlight}>{target[i]}</span>]);
          }
        }
        items = newItems;
      }
    }
    return items;
  };

  const addHighlight = (targetValue: string) => {
    let newTarget = [];
    for (let item of targetValue) {
      newTarget.push([<span className={css.highlight}>{item}</span>]);
    }
    return newTarget;
  };

  return <div key={source}>{handleHighlight()}</div>;
};

export default CompareDiff;
