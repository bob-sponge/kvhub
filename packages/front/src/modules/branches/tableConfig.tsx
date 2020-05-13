import React from 'react';
import * as css from './style/index.modules.less';

export const dataSource = [
  {
    key: '1',
    name: '胡彦斌',
    updateTime: 1588926099000,
    mergeRequest: 'Merged',
  },
  {
    key: '2',
    name: '胡彦祖',
    updateTime: 1588926099000,
    mergeRequest: 'open',
  },
  {
    key: '3',
    name: '胡彦祖',
    updateTime: 1588926099000,
    mergeRequest: 'open',
  },
  {
    key: '4',
    name: '胡彦祖',
    updateTime: 1588926099000,
    mergeRequest: 'open',
  },
  {
    key: '5',
    name: '胡彦祖',
    updateTime: 1588926099000,
    mergeRequest: 'open',
  },
  {
    key: '6',
    name: '胡彦祖',
    updateTime: 1588926099000,
    mergeRequest: 'open',
  },
];

export const columns = (onCompare: Function, onDelete: Function) => {
  let tableColumns: any[] = [
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Updated',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: 'Merge Request',
      dataIndex: 'mergeRequest',
      key: 'mergeRequest',
    },
    {
      title: 'Opeartion',
      key: 'operation',
      render: (_text: any, record: any) => (
        <div className={css.operation}>
          <span onClick={() => onCompare(record)}>Compare</span>
          <span onClick={() => onDelete(record)}>Delete</span>
        </div>
      ),
    },
  ];
  return tableColumns;
};
