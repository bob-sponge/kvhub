import React from 'react';
import moment from 'moment';
import * as css from './style/index.modules.less';
import { Popconfirm, Tooltip } from 'antd';

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
      render: (text: any) => {
        return (
          <Tooltip placement="top" title={text}>
            <div style={{ display: 'inline-block' }}>
              <span className={css.blockText} style={{ WebkitBoxOrient: 'vertical' }}>
                {text}
              </span>
            </div>
          </Tooltip>
        );
      },
      width: '50%',
    },
    {
      title: 'Updated',
      dataIndex: 'time',
      key: 'time',
      render: (text: any) => {
        return moment(text).format('YYYY/MM/DD HH:mm:ss');
      },
      width: '15%',
    },
    {
      title: 'Merge Request',
      dataIndex: 'merge',
      key: 'merge',
      width: '15%',
    },
    {
      title: 'Opeartion',
      key: 'operation',
      width: '20%',
      render: (_text: any, record: any) => (
        <div className={css.operation}>
          <span onClick={() => onCompare(record)}>Compare</span>
          {sessionStorage.getItem('userType') === '0' && !record.isMaster && (
            <Popconfirm title="Are you sure？" okText="Yes" cancelText="No" onConfirm={() => onDelete(record)}>
              <span>Delete</span>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];
  return tableColumns;
};
