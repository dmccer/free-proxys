const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proxy = new Schema({
  ip: String,
  port: Number,
  addr: String,
  // 1 高匿 2 普通
  anonym: Number,
  // 1 http 2 https 3 sockect
  type: Number,
  // 代理速度 s
  speed: Number,
  // 链接时间 s
  connect: Number,
  // 代理存活时间 minute
  live: Number,
  lastTestTime: Date
});

// 返回数据给用户时，将 _id 属性重命名为 id
proxy.set('toObject', {
  versionKey: false,

  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Proxy', proxy);
