import React from 'react';
import moment from 'moment';
import * as css from './style/index.modules.less';
import { Popconfirm } from 'antd';

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
      dataIndex: 'time',
      key: 'time',
      render: (text: any) => {
        return moment(text).format('YYYY/MM/DD HH:mm:ss');
      },
    },
    {
      title: 'Merge Request',
      dataIndex: 'merge',
      key: 'merge',
    },
    {
      title: 'Opeartion',
      key: 'operation',
      render: (_text: any, record: any) => (
        <div className={css.operation}>
          <span onClick={() => onCompare(record)}>Compare</span>
          <Popconfirm title="Are you sure？" okText="Yes" cancelText="No" onConfirm={() => onDelete(record)}>
            <span>Delete</span>
          </Popconfirm>
        </div>
      ),
    },
  ];
  return tableColumns;
};
