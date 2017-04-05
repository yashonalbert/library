import _ from 'lodash';
import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import { RecordModel } from '../models';

const router = Router({ prefix: '/api/users' });

function toJson(code, msg, ctx) {
  const json = {
    code,
    msg,
    request: `${ctx.method} ${ctx.url}`,
  };
  return json;
}

router.param('recordID', async (recordID, ctx, next) => {
  try {
    const result = await RecordModel.getRecordById(recordID);
    if (_.isNull(result)) {
      ctx.body = toJson(203, 'record not found', ctx);
    } else {
      ctx.record = result;
      await next();
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/search', async (ctx) => {
  try {
    const { keyWord, status, page } = ctx.query;
    const result = await RecordModel.searchRecords(keyWord, status, page);
    if (result === 'invalid status') {
      ctx.body = toJson(400, 'invalid status', ctx);
    } else {
      ctx.body = result;
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/messageSet', requireAdmin, async (ctx) => {
  try {
    const result = await ctx.user.messageSet(ctx.request.body.status);
    if (result === 'invalid status') {
      ctx.body = toJson(400, 'invalid status', ctx);
    } else {
      ctx.body = toJson(200, 'return success', ctx);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/records', requireAdmin, async (ctx) => {
  try {
    if (_.keys(ctx.query).includes('status')) {
      const { status, page } = ctx.query;
      const result = await RecordModel.getRecordByStatus(status, page);
      if (result === 'invalid status') {
        ctx.body = toJson(400, 'invalid status', ctx);
      } else {
        ctx.body = result;
      }
    } else if (_.keys(ctx.query).includes('isbn')) {
      const result = await RecordModel.getRecordByISBN(ctx.query.isbn);
      if (result === 'book not found') {
        ctx.body = toJson(203, 'book not found', ctx);
      } else {
        ctx.body = result;
      }
    } else {
      ctx.body = toJson(400, 'invalid status or isbn', ctx);
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/records', requireAdmin, async (ctx) => {
  try {
    const result = await RecordModel.returnBook(Number(ctx.request.body.recordID));
    if (result === 'invalid returnBook') {
      ctx.body = toJson(400, 'invalid returnBook', ctx);
    } else if (result === 'record not found') {
      ctx.body = toJson(203, 'record not found', ctx);
    } else {
      ctx.body = toJson(200, 'return success', ctx);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/records/:recordID', requireAdmin, async (ctx) => {
  ctx.body = ctx.record;
});

router.post('/records/:recordID', requireAdmin, async (ctx) => {
  try {
    const result = await ctx.record.confirm(ctx.request.body.action);
    if (result === 'invalid comfirm') {
      ctx.body = toJson(400, 'invalid comfirm', ctx);
    } else {
      ctx.body = toJson(200, 'confirm success', ctx);
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;
