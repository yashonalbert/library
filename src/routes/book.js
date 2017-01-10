import Router from 'koa-router';
import BookModel from '../models/book';

const router = Router({ prefix: '/books' });

router.get('/:bookID', async (ctx) => {
  ctx.body = await BookModel.findById(ctx.params.bookID);
});
