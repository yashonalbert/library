import _ from 'lodash';
import Joi from 'joi';
import cado from '../cado';

const UserModel = cado.model('user', {
  corpUserID: Joi.string().required(),
  name: Joi.string().required(),
  department: Joi.array().items(Joi.number()).required(),
  position: Joi.string().required(),
  mobile: Joi.string().required(),
  gender: Joi.number().required(),
  email: Joi.string().required(),
  weixinID: Joi.string().required(),
  avatar: Joi.string().required(),
  status: Joi.number().required(),
}, {
  indexes: {
    unique: ['userid'],
  },
  statics: {

  },
  methods: {
    getBorrowingHistory() {
      return cado.model('history').getBorrowingHistory(this.id);
    },
    borrowBook(bookID) {
      const HistoryModel = cado.model('history');
      const stock = cado.model('book').getStock(bookID);
      const borrowingCount = HistoryModel.getBorrowingBooksCount(this.id);
      if (stock > 0 || borrowingCount < 2) {
        HistoryModel.borrowBook(this.id, bookID);
        this.sendNotification('borrowBook', bookID);
      }
    },
    returnBook(bookID) {
      const stock = cado.model('book').getStock(bookID);
      if (stock > 0) {
        cado.model('history').borrowBook(bookID);
        this.sendNotification('borrowBook', bookID);
      }
    },
    sendNotification(template, ...args) {
      if (template === 'borrowBook') {
        const bookID = _.first(args);
        // TODO: 发往微信
      }
    },
  },
});

export default UserModel;
