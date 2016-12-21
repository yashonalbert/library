const crypto = require('crypto');
const request = require('request');
const _ = require('lodash');

exports.md5 = function(data){
  if (data)
    return crypto.createHash('md5').update(data).digest('hex');
  else {
    return null;
  }
};

exports.randomString = function(length){
  let char_map, result;
  char_map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result = _.map(_.range(0, length), function() {
    return char_map.charAt(Math.floor(Math.random() * char_map.length));
  });
  return result.join('');
};

exports.hashPassword = function(salt, password){
  return exports.md5(salt + exports.md5(password));
};

exports.spiderISBN = function(isbn, callback){
  request(`https://api.douban.com/v2/book/isbn/${isbn}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        let book = JSON.parse(body);
        return callback(null, book);
      } catch(e) {
        return callback(null, null);
      }
    }
    callback(null,null);
  });
};
