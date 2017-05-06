import _ from 'lodash';
import moment from 'moment';
import Router from 'koa-router';
import LRU from 'lru';
import { requireAdmin } from '../middleware';
import { RecordModel, UserModel } from '../models';

const router = Router({ prefix: '/api/users' });
let cache = new LRU({ maxAge: 5 * 60 * 1000 }),
  evicted

cache.on('evict',function(data) { evicted = data });

router.param('recordID', async (recordID, ctx, next) => {
  const result = await RecordModel.getRecordById(recordID);
  if (_.isNull(result)) {
    ctx.throw('record not found', 203);
  } else {
    ctx.record = result;
    await next();
  }
});

router.get('/count', async (ctx) => {
  if (_.isUndefined(ctx.query.keyWord)) {
    ctx.query.keyWord = '';
  }
  const { keyWord, status } = ctx.query;
  const result = await RecordModel.getRecordCount(keyWord, status);
  ctx.body = { count: result };
});

router.get('/search', async (ctx) => {
  const { keyWord, status, page } = ctx.query;
  const result = await RecordModel.searchRecords(keyWord, status, page);
  let records = result.map((item) => {
    let record = item.toJSON();
    record.lentTime = moment(record.lentTime).format('YYYY年MM月DD日');
    record.expiryTime = moment(record.expiryTime).format('YYYY年MM月DD日');
    if (!_.isNull(record.returnTime)) {
      record.returnTime = moment(record.returnTime).format('YYYY年MM月DD日');
    }
    return record;
  });
  ctx.body = records;
});

router.get('/getToken', requireAdmin, async (ctx) => {
  function getToken() {
    let random = _.random(100000, 999999);
    if (cache.keys.includes(random)) {
      return getToken();
    }
    return random;
  }
  const userID = ctx.cookies.get('userID', { signed: true });
  const user = await UserModel.findById(userID);
  const token = getToken();
  cache.set(token, user.id);
  ctx.body = { token };
});

router.post('/checkToken', async (ctx) => {
  const userID = cache.get(ctx.request.body.token);
  if (!_.isNull(userID)) {
    ctx.user = await UserModel.findById(userID);
    if (!_.isEmpty(ctx.user) && ctx.user.role === 'admin') {
      cache.remove(ctx.request.body.token);
      ctx.cookies.set('userID', userID, { signed: true });
      ctx.cookies.set('loggedIn', 1, { httpOnly: false });
      ctx.body = ctx.toJson(`login success`, 200);
    } else {
      ctx.throw('permission denied', 401);
    }
  } else {
    ctx.throw('invalid token', 400);
  }
});

router.post('/messageSet', requireAdmin, async (ctx) => {
  await ctx.user.messageSet(ctx.request.body.status);
  ctx.body = ctx.toJson(`message set ${ctx.request.body.status}`, 200);
});

router.get('/records', requireAdmin, async (ctx) => {
  if (_.keys(ctx.query).includes('status')) {
    const { status, page } = ctx.query;
    const result = await RecordModel.getRecordByStatus(status, page);
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
  } else if (_.keys(ctx.query).includes('isbn')) {
    const result = await RecordModel.getRecordByISBN(ctx.query.isbn);
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
    ctx.throw('invalid status or isbn', 400);
  }
});

router.post('/records', requireAdmin, async (ctx) => {
  await RecordModel.returnBook(Number(ctx.request.body.recordID));
  ctx.body = ctx.toJson('return success', 200);
});

router.get('/records/:recordID', requireAdmin, async (ctx) => {
  let record = ctx.record.toJSON()
  record.lentTime = moment(record.lentTime).format('YYYY年MM月DD日');
  record.expiryTime = moment(record.expiryTime).format('YYYY年MM月DD日');
  if (!_.isNull(record.returnTime)) {
    record.returnTime = moment(record.returnTime).format('YYYY年MM月DD日');
  }
  ctx.body = record;
});

router.post('/records/:recordID', requireAdmin, async (ctx) => {
  await ctx.record.confirm(ctx.request.body.action);
  ctx.body = ctx.toJson('confirm success', 200);
});

export default router;
