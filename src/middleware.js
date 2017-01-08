/* eslint-disable import/prefer-default-export */

import UserModel from './models/user';

const authentication = (ctx, next) => {
  const userID = ctx.cookies.get('userID', { signed: true });
  ctx.user = UserModel.findById(userID);
  if (!ctx.user && !['/user/oauth2', '/user/login'].includes(ctx.path)) {
    ctx.redirect('/user/oauth2');
  } else {
    next();
  }
};

export { authentication };
