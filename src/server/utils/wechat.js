import Wx from 'wechat-enterprise-api';
import Promise from 'bluebird';
import Logger from './logger';
import config from './config';

const loggerWechat = Logger('wechat');

class Wechat {
  constructor() {
    this.wx = new Wx(config.wechat.corpid, config.wechat.secret, config.wechat.agentid);
    this.retries = 0;
  }

  getAccessToken(ctx) {
    return Promise.promisify(this.wx.getAccessToken, { context: this.wx })
      .then(() => ctx.redirect(`http://${config.domain}`))
      .catch((error) => {
        this.errorHandling(error, ctx);
      });
  }

  errorHandling(error, ctx) {
    const errorCode = error.statusCode || error.status || 500;
    if (this.retries >= 5) {
      loggerWechat.info(`${errorCode} - ${ctx.method} ${ctx.url} - ${error.message}`);
      loggerWechat.info('retries >= 5');
      ctx.body = {
        msg: error.message,
        code: errorCode,
        request: `${ctx.method} ${ctx.url}`,
      };
      return null;
    }
    if (error.message.indexOf('access_token') !== -1) {
      this.retries += 1;
      loggerWechat.info(`${errorCode} - ${ctx.method} ${ctx.url} - ${error.message}`);
      loggerWechat.info(`retrie ${this.retries}`);
      return this.getAccessToken(ctx);
    }
    return Promise.reject({
      message: error.message,
      statusCode: errorCode,
    });
  }

  getJsConfig(param, ctx) {
    return Promise.promisify(this.wx.getJsConfig, { context: this.wx })(param)
      .catch((error) => {
        this.errorHandling(error, ctx);
      });
  }

  getUserIdByCode(code, ctx) {
    return Promise.promisify(this.wx.getUserIdByCode, { context: this.wx })(code)
      .catch((error) => {
        this.errorHandling(error, ctx);
      });
  }

  getUser(userId, ctx) {
    return Promise.promisify(this.wx.getUser, { context: this.wx })(userId)
      .catch((error) => {
        this.errorHandling(error, ctx);
      });
  }

  send(to, message, ctx) {
    return Promise.promisify(this.wx.send, { context: this.wx })(to, message)
      .catch((error) => {
        this.errorHandling(error, ctx);
      });
  }
}

const wechat = new Wechat();

export default wechat;
