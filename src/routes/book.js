import Router from 'koa-router';
import { BookModel } from '../models';

const router = Router({ prefix: '/books' });

router.get('/:bookID', async (ctx) => {
  ctx.body = await BookModel.findById(ctx.params.bookID);
});

export default router;
