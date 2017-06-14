import Wx from 'wechat-enterprise-api';
import Promise from 'bluebird';
import config from './config';

class Wechat {
  constructor(corpid, secret, agentid) {
    this.wx = new Wx(corpid, secret, agentid);
    this.retry = false;
  }

  ensure(method, ...args) {
    return method.apply(this, args).catch((error) => {
      if (this.retry) {
        return Promise.reject(error);
      }
      this.retry = true;
      if (error.message.indexOf('access_token') !== -1) {
        return Promise.promisify(this.wx.getAccessToken, { context: this.wx })()
          .then(() => method.apply(this, args));
      }
      return method.apply(this, args);
    });
  }

  getJsConfig(param) {
    return this.ensure(Promise.promisify(this.wx.getJsConfig, { context: this.wx }), param);
  }

  getUserIdByCode(code) {
    return this.ensure(Promise.promisify(this.wx.getUserIdByCode, { context: this.wx }), code);
  }

  getUser(userId) {
    return this.ensure(Promise.promisify(this.wx.getUser, { context: this.wx }), userId);
  }

  send(to, message) {
    return this.ensure(Promise.promisify(this.wx.send, { context: this.wx }), to, message);
  }
}

const wechat = new Wechat(config.wechat.corpid, config.wechat.secret, config.wechat.agentid);

export default wechat;
