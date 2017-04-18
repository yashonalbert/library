import 'babel-polyfill';

import fs from 'fs';
import Koa from 'koa';
import cors from 'kcors';
import send from 'koa-send';
import bodyParser from 'koa-bodyparser';
import Logger from './utils/logger';
import { userRoute, bookRoute, adminRoute } from './routes';
import { sequelize } from './models';
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

server.use(cors());
server.use(bodyParser());
server.use(authentication);

sequelize.sync();

server.use(userRoute.routes());
server.use(bookRoute.routes());
server.use(adminRoute.routes());

server.use(async (ctx) => {
  if (ctx.path !== '/' && fs.existsSync(`${__dirname}/public/web${ctx.path}`)) {
    return await send(ctx, `/lib/public/web${ctx.path}`);
  }
  return await send(ctx, '/lib/public/web/index.html');
});

export default server;
