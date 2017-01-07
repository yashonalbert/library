import 'babel-polyfill';
import Koa from 'koa';
import config from '../config.json';
import Logger from './logger';

const app = new Koa();
const logger = Logger('koa');

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.listen(config.port);
