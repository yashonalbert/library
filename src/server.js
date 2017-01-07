import 'babel-polyfill';
import Koa from 'koa';
import Logger from './utils/logger';

const server = new Koa();
const logger = Logger('koa');

server.keys = ['ZrlccFOdfHbnkEiL', 'GFNdT7CNVUfIh6HU'];

server.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

export default server;
