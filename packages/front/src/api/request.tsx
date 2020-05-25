import { ajax } from '@ofm/ajax';

// 添加请求拦截器
ajax.interceptors.request.use(
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  },
);

// 添加响应拦截器
ajax.interceptors.response.use(
  function(response) {
    return response.data;
  },
  function(error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  },
);
