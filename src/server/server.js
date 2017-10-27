import 'babel-polyfill';

import fs from 'fs';
import Koa from 'koa';
import send from 'koa-send';
import bodyParser from 'koa-bodyparser';
import Promise from 'bluebird';
import Raven from 'raven';
import config from './utils/config';
import Logger from './utils/logger';
import wechat from './utils/wechat';
import { spider, guard } from './utils/schedule';
import { userRoute, bookRoute, adminRoute } from './routes';
import { sequelize } from './models';
import { authentication } from './middleware';

const server = new Koa();
const loggerKoa = Logger('koa');
const loggerApi = Logger('api');

Raven.config(config.raven).install();

server.keys = ['ZrlccFOdfHbnkEiL', 'GFNdT7CNVUfIh6HU'];

server.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  loggerKoa.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

server.use(async (ctx, next) => {
  ctx.toJson = (msg, code) => {
    const json = {
      msg,
      code,
      request: `${ctx.method} ${ctx.url}`,
    };
    return json;
  };
  try {
    await next();
  } catch (error) {
    const errorCode = error.statusCode || error.status || 500;
    if (ctx.method === 'POST') {
      loggerApi.info(`${errorCode} - ${ctx.method} ${ctx.url} - ${error.message} - ${ctx.request.body}`);
    } else {
      loggerApi.info(`${errorCode} - ${ctx.method} ${ctx.url} - ${error.message}`);
    }
    await Promise.promisify(Raven.captureException, { context: Raven })(error);
    ctx.body = ctx.toJson(error.message, errorCode);
  }
});

server.use(bodyParser());
server.use(authentication);

sequelize.sync();

setInterval(spider, 30 * 1000);
setInterval(guard, 60 * 60 * 1000);

server.use(userRoute.routes());
server.use(bookRoute.routes());
server.use(adminRoute.routes());

server.use(async (ctx) => {
  if (ctx.path !== '/' && fs.existsSync(`${__dirname}/public${ctx.path}`)) {
    if (['/index.html', '/web.html'].includes(ctx.path)) {
      return ctx.body = fs.readFileSync(`${__dirname}/public${ctx.path}`, 'utf-8').replace('raven_config', config.raven);
    }
    return await send(ctx, `/lib/public${ctx.path}`);
  }
  return ctx.body = fs.readFileSync(`${__dirname}/public/index.html`, 'utf-8').replace('raven_config', config.raven);

});

export default server;
