import _ from 'lodash';
import Router from 'koa-router';
import wechat from '../utils/wechat';
import UserModel from '../models/user';

const router = Router({ prefix: '/user' });

router.get('/oauth2', (ctx) => {
  // TODO 将 URL 中变量换成正式的
  ctx.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=CORPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect');
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

export default router;
