import * as React from 'react';
import { ajax, initAjax } from '@ofm/ajax';
import { Modal } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { getServerIp } from './url';
// const Cookies = require('js-cookie');

let baseURL = '';
const errorList: any[] = [];
let isShowingError = false;

const showError = (cb?: Function) => {
  if (isShowingError || errorList.length === 0) {
    return;
  }
  const error = errorList[0];
  isShowingError = true;
  Modal.error({
    icon: null,
    title: (
      <div style={{ position: 'relative' }}>
        <CloseCircleOutlined style={{ position: 'absolute', top: '0', color: '#E8617C', fontSize: '22px' }} />
        <span style={{ fontSize: '16px', marginLeft: '34px', fontWeight: 600 }}>{error.msg}</span>
      </div>
    ),
    onOk: () => {
      if (cb) {
        cb();
      }
      isShowingError = false;
      errorList.shift();
      showError(cb);
    },
  });
};

function addErrorList(msg: any, cb?: Function) {
  const hasMsg = errorList.some(error => error.msg === msg);
  if (!hasMsg) {
    errorList.push({
      msg,
    });
    showError(cb);
  }
}

let hostIp = ''; // 下载地址ip
if (process.env.NODE_ENV === 'production') {
  hostIp = window.location.host;
} else {
  hostIp = getServerIp();
}

if (process.env.NODE_ENV === 'production') {
  baseURL = '/gateway';
} else {
  baseURL = getServerIp();
}

// init axis
initAjax({
  baseURL,
  withCredentials: true,
});

// 添加请求拦截器
ajax.interceptors.request.use(
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  },
);

// trasform axiosResponse to ajaxResponse
ajax.interceptors.response.use(response => {
  let data = response.data;
  if (data.success !== undefined && (data.success === false || data.success === null) && !!data.data) {
    addErrorList(data.data);
  }
  return data;
});

export { baseURL, hostIp };