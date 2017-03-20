import _ from 'lodash';
import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import { BookModel } from '../models';

const router = Router({ prefix: '/api/books' });

function toJson(code, msg, ctx) {
  const json = {
    code,
    msg,
    request: `${ctx.method} ${ctx.url}`,
  };
  return json;
}

router.param('bookID', async (bookID, ctx, next) => {
  try {
    const result = await BookModel.getBook(bookID);
    if (_.isNull(result)) {
      ctx.body = toJson(203, 'book not found', ctx);
    } else {
      ctx.book = result;
      await next();
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/bookList', requireAdmin, async (ctx) => {
  try {
    const result = await BookModel.getBookByStatus(ctx.query.status);
    if (result === 'invalid status') {
      ctx.body = toJson(400, 'invalid status', ctx);
    } else {
      ctx.body = result;
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/requestBook', async (ctx) => {
  try {
    ctx.body = await BookModel.requestBook(ctx.query.isbn);
  } catch (error) {
    if (_.isUndefined(error.error.msg) && error.error.msg === 'book_not_found') {
      ctx.body = toJson(203, 'book not found', ctx);
    } else if (_.isUndefined(error.error.msg) && error.error.msg === 'invalid_request_uri') {
      ctx.body = toJson(400, 'invalid request uri', ctx);
    } else {
      console.log(error);
    }
  }
});

router.post('/setBook', requireAdmin, async (ctx) => {
  try {
    const book = _.omit(ctx.request.body, ['action']);
    book.totalNum = Number(book.totalNum);
    const result = await BookModel.setBook(book, ctx.request.body.action);
    if (result === 'invalid action') {
      ctx.body = toJson(400, 'invalid action', ctx);
    } else if (result === 'stock over limit') {
      ctx.body = toJson(400, 'stock over limit', ctx);
    } else {
      ctx.body = toJson(200, 'set success', ctx);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/lentValidation/:bookID', async (ctx) => {
  try {
    ctx.body = await ctx.user.lentValidation(ctx.params.bookID);
  } catch (error) {
    console.log(error);
  }
});

router.get('/:bookID', async (ctx) => {
  ctx.body = ctx.book;
});

router.post('/:bookID', requireAdmin, async (ctx) => {
  try {
    const result = await ctx.book.changeStatus(ctx.request.body.action);
    if (result === 'invalid action') {
      ctx.body = toJson(400, 'invalid action', ctx);
    } else if (result === 'lentCount > 0') {
      ctx.body = toJson(400, 'lentCount > 0', ctx);
    } else {
      ctx.body = toJson(200, 'change success', ctx);
    }
  } catch (error) {
    console.log(error);
  }
});
export default router;
