/* eslint-disable max-len */

import _ from 'lodash';
import moment from 'moment';
import Router from 'koa-router';
import wechat from '../utils/wechat';
import { RecordModel, UserModel } from '../models';
import config from '../utils/config';

const router = Router({ prefix: '/api/user' });

router.get('/userInfo', (ctx) => {
  ctx.body = {
    name: ctx.user.name,
    message: ctx.user.message,
    role: ctx.user.role,
  };
});

router.get('/jssign', async (ctx) => {
  const param = {
    debug: false,
    jsApiList: ctx.query.jsApiList.split(','),
    url: ctx.query.url,
  };
  const jsConfig = await wechat.getJsConfig(param);
  jsConfig.timestamp = Number(jsConfig.timestamp);
  ctx.body = jsConfig;
});

router.get('/oauth2', (ctx) => {
  ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.corpid}&redirect_uri=${encodeURIComponent(`http://${config.domain}/api/user/login`)}&response_type=code&scope=snsapi_base`);
});

router.get('/login', async (ctx) => {
  if (!ctx.query.code) {
    ctx.throw(400, 'code is required !');
  }
  const { UserId } = await wechat.getUserIdByCode(ctx.query.code);
  const result = await wechat.getUser(UserId);
  const userData = _.extend(_.pick(result, ['name', 'position', 'mobile', 'gender', 'email', 'avatar', 'status']),
    { department: _.toString(result.department), weixinID: result.weixinid, corpUserID: result.userid });

  await UserModel.upsert(userData);
  const user = await UserModel.findOne({ where: { corpUserID: userData.corpUserID } });
  ctx.cookies.set('userID', user.id, { signed: true });
  ctx.cookies.set('loggedIn', 1, { httpOnly: false });

  ctx.redirect('/');
});

router.post('/records', async (ctx) => {
  await RecordModel.lentBook(ctx.user.id, Number(ctx.request.body.bookID));
  ctx.body = ctx.toJson('submit success', 200);
});

router.get('/records', async (ctx) => {
  const result = await ctx.user.getLentRecord();
  let records = result.map((item) => {
    let record = item.toJSON()
    record.lentTime = moment(record.lentTime).format('YYYY年MM月DD日');
    if (!_.isNull(record.returnTime)) {
      record.returnTime = moment(record.returnTime).format('YYYY年MM月DD日');
    }
    return record;
  });
  ctx.body = records;
});

router.get('/records/:recordID', async (ctx) => {
  const result = await RecordModel.getRecordById(ctx.params.recordID);
  if (_.isNull(result)) {
    ctx.throw('record not found', 203);
  } else if (result.userID === ctx.user.id) {
    let records = result.map((item) => {
      let record = item.toJSON()
      record.lentTime = moment(record.lentTime).format('YYYY年MM月DD日');
      record.expiryTime = moment(record.expiryTime).format('YYYY年MM月DD日');
      if (!_.isNull(record.returnTime)) {
        record.returnTime = moment(record.returnTime).format('YYYY年MM月DD日');
      }
      return record;
    });
    ctx.body = records;
  } else {
    ctx.throw('permission denied', 401);
  }
});

export default router;
