import React from 'react';
import moment from 'moment';
import { SwapRightOutlined, SwapOutlined } from '@ant-design/icons';
import * as css from './styles/mergeRequest.modules.less';
import { Popconfirm } from 'antd';

const TYPE_STATE = {
  '0': 'created',
  '1': 'merged',
  '2': 'refused',
  '3': 'mergeing',
  '4': 'failed',
};

export const columns = (onMerge: Function, onResufe: Function) => {
  let tableColumns: any[] = [
    {
      key: 'crosMerge',
      title: 'Title',
      dataIndex: 'crosMerge',
      render: (text: any, record: any) => {
        return (
          <span>
            {record.sourceBranchName}
            {text ? <SwapOutlined className={css.mergeIcon} /> : <SwapRightOutlined className={css.mergeIcon} />}
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
      key: 'modifier',
      title: 'Author',
      dataIndex: 'modifier',
    },
    {
      key: 'type',
      title: 'Status',
      dataIndex: 'type',
      render: (text: any) => {
        return TYPE_STATE[text];
      },
    },
    {
      title: 'Opeartion',
      key: 'operation',
      render: (_text: any, record: any) => (
        <div className={css.operation}>
          {record.type === '0' && localStorage.getItem('userType') === '0' && (
            <>
              <span onClick={() => onMerge(record)}>Merge</span>
              <Popconfirm
                title="Are you sure to refuse the merge？"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onResufe(record)}>
                <span>Refused</span>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];
  return tableColumns;
};
