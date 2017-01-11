import 'babel-polyfill';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Logger from './utils/logger';
import sequelize from './utils/sequelize';
import userRoute from './routes/user';
import bookRoute from './routes/book';
import adminRoute from './routes/admin';
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

sequelize.sync();

server.use(userRoute.routes());
server.use(bookRoute.routes());
server.use(adminRoute.routes());

export default server;
