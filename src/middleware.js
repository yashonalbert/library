import { UserModel } from './models';

const authentication = async (ctx, next) => {
  const userID = ctx.cookies.get('userID', { signed: true });
  ctx.user = await UserModel.findById(userID);
  if (!ctx.user && !['/api/user/oauth2', '/api/user/login'].includes(ctx.path)) {
    ctx.redirect('/api/user/oauth2');
  } else {
    await next();
  }
};

const requireAdmin = async (ctx, next) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    ctx.throw(403);
  } else {
    await next();
  }
};

export { authentication, requireAdmin };
