const mongoose = require('mongoose');
const path = require('path');
const data = require('./data');

function connect() {
  console.info('正在连接数据库...');
  mongoose.connect(data.mongodb.url + ':' + data.mongodb.port + '/' + data.mongodb.name, {
    db: { native_parser: true },
    server: {
      poolsize: 5
    },
    user: data.mongodb.user,
    pass: data.mongodb.pass
  });
  console.info('数据库连接成功...');
}

connect();

mongoose.connection.on('error', function(err) {
  console.error('数据库连接错误：');
  console.info(err.message);
});

mongoose.connection.on('disconnected', function() {
  console.warn('数据库连接断开，正重连...');
  connect();
  console.warn('数据库重新连接成功');
});
