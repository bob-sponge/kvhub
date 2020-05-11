import React from 'react';

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

export const columns = [
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
    render: () => (
      <>
        <span>Compare</span>
        <span>Delete</span>
      </>
    ),
  },
];
