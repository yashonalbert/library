import Router from 'koa-router';

const router = Router({ prefix: '/user' });

// TODO 将 URL 中变量换成正式的
router.redirect('/oauth2', 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=CORPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect');

router.get('/login', (ctx, next) => {

});

export default router;
