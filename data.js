const path = require('path');
const root = __dirname;

module.exports = {
  root: root,
  proxy_site: 'http://www.xicidaili.com/nn',
  // 抓取代理页面需要翻墙.....
  proxy: 'http://60.185.139.88:808',
  proxys_file: path.resolve(root, './tmp/ips.json'),
  mongodb: {
    name: 'proxys',
    url: 'mongodb://127.0.0.1',
    port: '27017',
    user: 'kane',
    pass: 'yunhua@926'
  }
};
