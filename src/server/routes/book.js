import _ from 'lodash';
import Router from 'koa-router';
import multer from 'koa-multer';
import { requireAdmin } from '../middleware';
import { BookModel, RecordModel, QueueModel } from '../models';

const router = Router({ prefix: '/api/books' });
const upload = multer({ dest: 'tmp/' });

router.param('bookID', async (bookID, ctx, next) => {
  const result = await BookModel.getBook(bookID);
  if (_.isNull(result)) {
    ctx.throw('book not found', 203);
  } else {
    ctx.book = result;
    await next();
  }
});

router.post('/multiple', requireAdmin, upload.single('file'), async (ctx) => {
  await BookModel.multiple(ctx.req.file.path);
  ctx.body = ctx.toJson('multiple success', 200);
});

router.get('/queue', requireAdmin, async (ctx) => {
  const success = await QueueModel.findAll({ where: { isQueue: true } });
  const fail = await QueueModel.findAll({ where: { isQueue: false } });
  ctx.body = {
    success,
    fail,
  };
});

router.post('/recommend', async (ctx) => {
  await RecordModel.sendNotification('recommend', ctx.request.body);
  ctx.body = ctx.toJson('recommend success', 200);
});

router.get('/count', async (ctx) => {
  if (_.isUndefined(ctx.query.keyWord)) {
    ctx.query.keyWord = '';
  }
  const { keyWord, status } = ctx.query;
  const result = await BookModel.getBookCount(keyWord, status);
  ctx.body = { count: result };
});

router.get('/search', async (ctx) => {
  const { keyWord, status, page } = ctx.query;
  ctx.body = await BookModel.getBookByStatus(keyWord, status, page);
});

router.get('/bookList', async (ctx) => {
  const { status, page } = ctx.query;
  ctx.body = await BookModel.getBookByStatus('', status, page);
});

router.get('/requestBook', async (ctx) => {
  ctx.body = await BookModel.requestBook(ctx.query.isbn);
});

router.post('/setBook', requireAdmin, async (ctx) => {
  const book = _.omit(ctx.request.body, ['action']);
  book.totalNum = Number(book.totalNum);
  await BookModel.setBook(book, ctx.request.body.action);
  ctx.body = ctx.toJson('set success', 200);
});

router.get('/lentValidation/:bookID', async (ctx) => {
  ctx.body = await ctx.user.lentValidation(ctx.params.bookID);
});

router.get('/:bookID', async (ctx) => {
  ctx.body = ctx.book;
});

router.post('/:bookID', requireAdmin, async (ctx) => {
  await ctx.book.changeStatus(ctx.request.body.action);
  ctx.body = ctx.toJson('change success', 200);
});

export default router;
