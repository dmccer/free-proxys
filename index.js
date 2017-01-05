const fs = require('fs');
const cheerio = require('cheerio');
const req = require('./req');
const data = require('./data');
const ProxyModel = require('./model/proxy');
require('./db');

const PROXY_TYPE = {
  HTTP: 1,
  HTTPS: 2,
  'socks4/5': 3
};

const PROXY_ANONYM = {
  '高匿': 1,
  '透明': 2
};

function transLive(text) {
  let reg = /[^\d]+/;
  let num = parseInt(text);
  let r = text.match(reg);

  if (!r) {
    return num;
  }

  if (r[0] === '分钟') {
    return num;
  }

  if (r[0] === '小时') {
    return num * 60;
  }

  if (r[0] === '天') {
    return num * 24 * 60;
  }
}

function parser(body, callback) {
  let ips = [];

  try {
    let $ = cheerio.load(body, {
      normalizeWhitespace: false,
      decodeEntities: true
    });

    $('#ip_list tr').each(function(index) {
      if (index === 0) {
        return;
      }

      let $tds = $(this).find('td');

      ips.push({
        ip: $tds.eq(1).text(),
        port: parseInt($tds.eq(2).text()),
        addr: $tds.eq(3).text().replace(/\\n|\s/g, ''),
        anonym: PROXY_ANONYM[$tds.eq(4).text()],
        type: PROXY_TYPE[$tds.eq(5).text()],
        speed: parseFloat($tds.eq(6).find('div').attr('title').replace('秒', '')),
        connect: parseFloat($tds.eq(7).find('div').attr('title').replace('秒', '')),
        live: transLive($tds.eq(8).text()),
        lastTestTime: new Date(`20${$tds.eq(9).text()}`)
      });
    });
  } catch (err) {
    callback(err);
  }

  callback(null, ips);
}

function get_proxy(url, callback) {
  req(url, function(body, err) {
    if (body == null || err) {
      console.log(`获取代理页面失败:${url}`);
      callback(err);
      return;
    }

    parser(body, callback);
  });
}

let savedCount = 0;
let max = 0;

function save(err, ips) {
  if (err) {
    savedCount++;
    console.log(`${Math.round(savedCount / max * 100) / 100}%`);
    return;
  }

  let saveIpPromises = ips.map((item) => {
    return new Promise((resolve, reject) => {
      ProxyModel.findOneAndUpdate({
        ip: item.ip,
        port: item.port
      }, item, {
        new: true,
        upsert: true
      }, (err, doc) => {
        if (err) {
          reject(err);
        }

        resolve(doc);
      });
    });
  });

  Promise.all(saveIpPromises)
    .then(() => {
      savedCount++;
      console.log(`${Math.round(savedCount / max * 100) / 100}%`);
      if (savedCount === max) {
        console.log('*** 完成 ***');
      }
    });
}

function analyze() {
  req(data.proxy_site, (body, err) => {
    if (body == null || err) {
      console.log('获取代理页面失败');
      return;
    }

    let $ = cheerio.load(body, {
      normalizeWhitespace: false,
      decodeEntities: true
    });

    let pages = $('.pagination a');
    max = parseInt(pages.eq(pages.length - 2).text());
    let i = 1;

    function start() {
      get_proxy(`${data.proxy_site}/${i}`, (err, ips) => {
        save(err, ips);
        i++;

        if (i < max) {
          start();
        }
      });
    }

    parser(body, (err, ips) => {
      save(err, ips);
      start();
    });
  });
}

analyze();
