import _ from 'lodash';
import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import { RecordModel } from '../models';

const router = Router({ prefix: '/api/users' });

router.param('recordID', async (recordID, ctx, next) => {
  ctx.record = await RecordModel.getRecordById(recordID);
  await next();
});

router.get('/records', requireAdmin, async (ctx) => {
  if (_.keys(ctx.query).includes('status')) {
    ctx.body = await RecordModel.getRecordByStatus(ctx.query.status);
  } else if (_.keys(ctx.query).includes('isbn')) {
    ctx.body = await RecordModel.getRecordByISBN(ctx.query.isbn);
  } else {
    ctx.body = [];
  }
});

router.post('/records', requireAdmin, async (ctx) => {
  ctx.body = await RecordModel.returnBook(Number(ctx.request.body.recordID));
});

router.get('/records/:recordID', requireAdmin, async (ctx) => {
  ctx.body = ctx.record;
});

router.post('/records/:recordID', requireAdmin, async (ctx) => {
  await ctx.record.confirm(ctx.request.body.action);
  ctx.body = { status: 'success' };
});

export default router;
