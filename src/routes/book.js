import Router from 'koa-router';
import { BookModel } from '../models';

const router = Router({ prefix: '/books' });

router.get('/:bookID', async (ctx) => {
  ctx.body = await BookModel.getBook(ctx.params.bookID);
});

router.get('/lentValidation/:bookID', async (ctx) => {
  ctx.body = await ctx.user.lentValidation(ctx.params.bookID);
});

export default router;
