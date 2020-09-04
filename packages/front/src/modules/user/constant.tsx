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
      key: 'lastTime',
      title: 'Lastest Login',
      dataIndex: 'lastTime',
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
          <div className={css.operation}>
            {permissions &&
              permissions.length > 0 &&
              permissions.map((item: any) => {
                if (item === 'delete') {
                  return <span onClick={() => onDelete(record)}>Delete</span>;
                } else if (item === 'reset') {
                  return <span onClick={() => onReset(record)}>Reset</span>;
                } else if (item === 'set') {
                  return (
                    <span onClick={() => setAdmin(record)}>
                      {record.admin === 0 ? 'Set to General' : 'Set to Admin'}
                    </span>
                  );
                } else {
                  return null;
                }
              })}
          </div>
        );
      },
    },
  ];
  return tableColumns;
};
