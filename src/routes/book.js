import _ from 'lodash';
import Router from 'koa-router';
import { BookModel } from '../models';

const router = Router({ prefix: '/books' });

router.param('bookID', async (bookID, ctx, next) => {
  ctx.book = await BookModel.getBook(bookID);
  await next();
});

router.get('/bookList', async (ctx) => {
  ctx.body = await BookModel.getBookByStatus(ctx.query.status);
});

router.get('/requestBook', async (ctx) => {
  ctx.body = await BookModel.requestBook(ctx.query.isbn);
});

router.post('/setBook', async (ctx) => {
  const book = _.omit(ctx.request.body, ['action']);
  book.totalNum = Number(book.totalNum);
  ctx.body = await BookModel.setBook(book, ctx.request.body.action);
});

router.get('/lentValidation/:bookID', async (ctx) => {
  ctx.body = await ctx.user.lentValidation(ctx.params.bookID);
});

router.get('/:bookID', async (ctx) => {
  ctx.body = ctx.book;
});

router.post('/:bookID', async (ctx) => {
  ctx.body = await ctx.book.changeStatus(ctx.request.body.action);
});
export default router;
