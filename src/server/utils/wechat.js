import Wx from 'wechat-enterprise-api';
import Promise from 'bluebird';
import config from './config';

class Wechat {
  constructor(corpid, secret, agentid) {
    this.wx = new Wx(corpid, secret, agentid);
    this.retries = 0;
  }

  getAccessToken(method, args) {
    return Promise.promisify(this.wx.getAccessToken, { context: this.wx })
      .then(() => {
        const newargs = Array.prototype.slice.call(args);
        return method.apply(this, newargs);
      });
  }

  errorHandling(error, method, args) {
    const errorCode = error.statusCode || error.status || 500;
    if (this.retries >= 5) {
      return Promise.reject({
        msg: `retries >= 5 - ${error.message}`,
        code: errorCode,
      });
    }
    if (error.message.indexOf('access_token') !== -1) {
      this.retries += 1;
      return this.getAccessToken(method, args);
    }
    return Promise.reject(error);
  }

  getJsConfig(param) {
    return Promise.promisify(this.wx.getJsConfig, { context: this.wx })(param)
      .catch((error) => {
        this.errorHandling(error, this.getJsConfig, arguments);
      });
  }

  getUserIdByCode(code) {
    return Promise.promisify(this.wx.getUserIdByCode, { context: this.wx })(code)
      .catch((error) => {
        this.errorHandling(error, this.getUserIdByCode, arguments);
      });
  }

  getUser(userId) {
    return Promise.promisify(this.wx.getUser, { context: this.wx })(userId)
      .catch((error) => {
        this.errorHandling(error, this.getUser, arguments);
      });
  }

  send(to, message) {
    return Promise.promisify(this.wx.send, { context: this.wx })(to, message)
      .catch((error) => {
        this.errorHandling(error, this.send, arguments);
      });
  }
}

const wechat = new Wechat(config.wechat.corpid, config.wechat.secret, config.wechat.agentid);

export default wechat;
