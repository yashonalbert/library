const crypto = require('crypto');
const request = require('request');
const _ = require('lodash');

exports.md5 = (data) => {
  if (data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }
  return null;
};

exports.randomString = (length) => {
  const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const result = _.map(_.range(0, length), () =>
    charMap.charAt(Math.floor(Math.random() * charMap.length)));
  return result.join('');
};

exports.hashPassword = (salt, password) => exports.md5(salt + exports.md5(password));

exports.spiderISBN = (isbn, callback) => {
  request(`https://api.douban.com/v2/book/isbn/${isbn}`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      try {
        const book = JSON.parse(body);
        return callback(null, book);
      } catch (e) {
        return callback(null, null);
      }
    }
    callback(null, null);
  });
};
