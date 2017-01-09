import _ from 'lodash';
import Router from 'koa-router';
import wechat from '../utils/wechat';
import UserModel from '../models/user';

const router = Router({ prefix: '/user' });
const { config } = global.app;

router.get('/oauth2', (ctx) => {
  ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.corpid}&redirect_uri=${encodeURIComponent(`http://${config.domain}/user/login`)}&response_type=code&scope=snsapi_base`);
});

router.get('/login', async (ctx) => {
  if (!ctx.query.code) {
    ctx.throw(400, 'code is required !');
  }
  const { UserId } = await Promise.promisify(wechat.getUserIdByCode)(ctx.query.code);
  const result = await Promise.promisify(wechat.getUser)(UserId);
  const userData = _.extend(_.pick(result, ['name', 'department', 'position', 'mobile',
    'gender', 'email', 'avatar', 'status']), { weixinID: result.weixinid, corpUserID: result.userid });

  const user = UserModel.create(userData);
  ctx.cookies.set('userID', user.id, { signed: true });

  ctx.redirect('/');
});

router.post('/records', (ctx) => {
  ctx.body = ctx.user.lentBook(ctx.request.body.bookID);
});

export default router;
