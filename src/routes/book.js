import Router from 'koa-router';
import BookModel from '../models/book';

const router = Router({ prefix: '/books' });

router.get('/:bookID', (ctx) => {
  ctx.body = BookModel.findById(ctx.params.bookID);
});
