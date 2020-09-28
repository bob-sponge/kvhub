import React from 'react';
import * as css from './index.modules.less';
import { timeAgo } from '../dashboard/constant';

const TYPE_STATE = {
  '0': 'Normal',
  '1': 'LADP',
};

const USER_TYPE = {
  0: 'Admin',
  1: 'General',
};

export const columns = (onDelete: Function, onReset: Function, setAdmin: Function) => {
  let tableColumns: any[] = [
    {
      key: 'name',
      title: 'Username',
      dataIndex: 'name',
    },
    {
      key: 'type',
      title: 'Login Type',
      dataIndex: 'type',
      render: (text: any) => {
        return TYPE_STATE[text];
      },
    },
    {
      key: 'department',
      title: 'Department',
      dataIndex: 'department',
    },
    {
      key: 'admin',
      title: 'User Type',
      dataIndex: 'admin',
      render: (text: any) => {
        return USER_TYPE[text];
      },
    },
    {
      key: 'lastTimestamp',
      title: 'Lastest Login',
      dataIndex: 'lastTimestamp',
      render: (text: any) => {
        if (text) {
          return timeAgo(text);
        } else {
          return text;
        }
      },
    },
    {
      title: 'Opeartion',
      key: 'operation',
      render: (_text: any, record: any) => {
        let permissions: any[] = [];
        const { permission } = record;
        if (permission.includes(',')) {
          let auth = permission.split(',');
          permissions = permissions.concat(auth);
        } else {
          permissions.push(permissions);
        }
        return (
          <>
            {sessionStorage.getItem('userType') === '0' && (
              <div className={css.operation}>
                <span onClick={() => onDelete(record)}>Delete</span>
                <span onClick={() => onReset(record)}>Reset</span>
                <span onClick={() => setAdmin(record)}>{record.admin === 0 ? 'Set to General' : 'Set to Admin'}</span>
              </div>
            )}
          </>
        );
      },
    },
  ];
  return tableColumns;
};
