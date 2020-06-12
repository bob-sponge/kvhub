import React from 'react';
import * as css from './styles/mergeRequest.modules.less';
import { Popconfirm } from 'antd';

export const columns = (onMerge: Function, onDelete: Function) => {
  let tableColumns: any[] = [
    {
      key: 'Title',
      title: 'Title',
      dataIndex: 'Title',
    },
    {
      key: 'Updated',
      title: 'Updated',
      dataIndex: 'Updated',
    },
    {
      key: 'Author',
      title: 'Author',
      dataIndex: 'Author',
    },
    {
      key: 'Status',
      title: 'Status',
      dataIndex: 'Status',
    },
    {
      title: 'Opeartion',
      key: 'operation',
      render: (_text: any, record: any) => (
        <div className={css.operation}>
          <span onClick={() => onMerge(record)}>Merge</span>
          <Popconfirm title="Are you sure？" okText="Yes" cancelText="No" onConfirm={() => onDelete(record)}>
            <span>Delete</span>
          </Popconfirm>
        </div>
      ),
    },
  ];
  return tableColumns;
};
