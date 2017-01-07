import Joi from 'joi';
import cado from '../utils/cado';

const BookModel = cado.model('book', {
  doubanID: Joi.number().required(),
  isbn: Joi.string().required(),
  title: Joi.string().required(),
  subtitle: Joi.string().required(),
  origin_title: Joi.string().required(),
  author: Joi.array().items(Joi.string()).required(),
  translator: Joi.array().items(Joi.string()).required(),
  image: Joi.string().required(),
  numRaters: Joi.number().required(),
  averageRating: Joi.number().required(),
  pubdate: Joi.string().required(),
  publisher: Joi.string().required(),
  summary: Joi.string().required(),
  totalNum: Joi.number().required(),
}, {
  statics: {
    getStock(bookID) {
      return this.totalNum - cado.model('record').count({
        bookID,
        status: {
          $in: ['borrowed', 'outdated'],
        },
      });
    },
  },
  methods: {
    getStock() {
      return this.constructor.getStock(this.id);
    },
  },
});

export default BookModel;
