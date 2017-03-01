import Router from 'koa-router';
import { requireAdmin } from '../middleware';
import { BookModel } from '../models';

const router = Router({ prefix: '/books' });

router.get('/:bookID', async (ctx) => {
  ctx.body = await BookModel.getBook(ctx.params.bookID);
});

router.get('/lentValidation/:bookID', async (ctx) => {
  ctx.body = await ctx.user.lentValidation(ctx.params.bookID);
});

router.get('/requestBook', async (ctx) => {
  // const book = await BookModel.requestBook(ctx.query.isbn);
  // console.log(book);
  ctx.body = {
    doubanID: '1003078',
    isbn: '9787505715660',
    title: '小王子',
    origin_title: '',
    subtitle: '',
    image: 'https://img3.doubanio.com/mpic/s1001902.jpg',
    author: '（法）圣埃克苏佩里',
    translator: '胡雨苏',
    publisher: '中国友谊出版公司',
    pubdate: '2000-9-1',
    numRaters: 9438,
    averageRating: '9.1',
    summary: '小王子驾到！',
  };
});


export default router;
