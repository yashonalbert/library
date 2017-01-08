import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import RecordModel from '../models/record';

const router = Router({ prefix: '/users' });

router.get('/records', requireAdmin, (ctx) => {
  let records = RecordModel.getConfirmingRecord();
  records = records.map((record) => {
    record.user = record.populate('userID');
    record.book = record.populate('bookID');
    return record;
  });
  ctx.body = records;
});

router.get('/records/:recordID', requireAdmin, (ctx) => {
  ctx.body = RecordModel.findById(ctx.params.recordID);
});

router.post('/records/:recordID', requireAdmin, (ctx) => {
  const record = RecordModel.findById(ctx.params.recordID);
  record.confirm(ctx.request.body.action);
  ctx.body = { status: 'success' };
});
