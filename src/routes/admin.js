import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import RecordModel from '../models/record';

const router = Router({ prefix: '/users' });

router.param('recordID', async (recordID, ctx, next) => {
  ctx.record = await RecordModel.findById(recordID);
  await next();
});

router.get('/records', requireAdmin, async (ctx) => {
  ctx.body = await RecordModel.getConfirmingRecord();
});

router.get('/records/:recordID', requireAdmin, async (ctx) => {
  ctx.body = ctx.record;
});

router.post('/records/:recordID', requireAdmin, async (ctx) => {
  await ctx.record.confirm(ctx.request.body.action);
  ctx.body = { status: 'success' };
});

export default router;
