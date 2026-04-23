module.exports = function(config, _paths) {
  if (process.env.NODE_ENV === 'development') {
    config.devServer = {
      proxy: {
        '/kvhub/kb': {
          target: 'http://10.192.30.87:80',
          changeOrigin: true,
          // 先不加 pathRewrite，看看能不能通
        },
      },
    };
  }
  return config;
};
