import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import RecordModel from '../models/record';

const router = Router({ prefix: '/users' });

router.param('recordID', requireAdmin, async (recordID, next) => {
  this.record = await RecordModel.findById(recordID);
  await next();
});

router.get('/records', requireAdmin, async (ctx) => {
  ctx.body = await RecordModel.getConfirmingRecord();
});

router.get('/records/:recordID', async (ctx) => {
  ctx.body = this.record;
});

router.post('/records/:recordID', async (ctx) => {
  await ctx.record.confirm(ctx.request.body.action);
  ctx.body = { status: 'success' };
});
