import _ from 'lodash';
import { UserModel } from './models';

const authentication = async (ctx, next) => {
  const ignorePath = [
    '/api/user/oauth2',
    '/api/user/login',
    '/api/users/checkToken',
    '/css/amazeui.min.css',
    '/css/app.min.css',
    '/js/raven.min.js',
    '/js/app.min.js',
    '/i/favicon.png',
    '/fonts/fontawesome-webfont.woff2',
    '/web.html',
    '/WW_verify_RiQoPYCu1NaVAKvO.txt'
  ];
  const userID = ctx.cookies.get('userID', { signed: true });
  ctx.user = await UserModel.findById(userID);
  if (!ctx.user && !ignorePath.includes(ctx.path)) {
    ctx.redirect('/api/user/oauth2');
  } else {
    await next();
  }
};

const requireAdmin = async (ctx, next) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    ctx.throw('permission denied', 401);
  } else {
    await next();
  }
};

export { authentication, requireAdmin };
