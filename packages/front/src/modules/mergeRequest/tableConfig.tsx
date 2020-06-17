import React from 'react';
import moment from 'moment';
import * as css from './styles/mergeRequest.modules.less';
import { Popconfirm } from 'antd';

export const columns = (onMerge: Function, onDelete: Function) => {
  let tableColumns: any[] = [
    {
      key: 'sourceBranchName',
      title: 'Title',
      dataIndex: 'Title',
      render: (_text: any, record: any) => {
        return (
          <span>
            {record.sourceBranchName}
            {record.targetBranchName}
          </span>
        );
      },
    },
    {
      key: 'modifyTime',
      title: 'Updated',
      dataIndex: 'modifyTime',
      render: (text: any) => {
        return moment(text).format('YYYY/MM/DD HH:mm:ss');
      },
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
