import 'babel-polyfill';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Logger from './utils/logger';
import userRoute from './routes/user';
import { authentication } from './middleware';

const server = new Koa();
const logger = Logger('koa');

server.keys = ['ZrlccFOdfHbnkEiL', 'GFNdT7CNVUfIh6HU'];

server.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
server.use(bodyParser());
server.use(authentication);

server.use(userRoute.routes());

export default server;
