import _ from 'lodash';
import Joi from 'joi';
import cado from '../cado';

const HistoryModel = cado.model('history', {
  userID: Joi.string().required(),
  bookID: Joi.number().required(),
  lentTime: Joi.date().default(Date.now),
  returnTime: Joi.date(),
  status: Joi.string().valid('confirming', 'rejected', 'borrowed', 'returned', 'outdated').default('confirming'),
}, {
  indexes: {
    indices: ['userID', 'bookID', 'status'],
  },
  foreignKeys: {
    userID: 'user',
    bookID: 'book',
  },
  statics: {
    getBorrowingHistory(userID) {
      return this.find({
        userID,
        status: {
          $in: ['borrowed', 'returned', 'outdated'],
        },
      });
    },
    getBorrowingBooksCount(userID) {
      return this.count({
        userID,
        status: {
          $in: ['borrowed', 'outdated'],
        },
      });
    },
    findHistory(userID, bookID) {
      return _.first(this.findBySort({
        userID,
        bookID,
        status: {
          $in: ['borrowed', 'outdated'],
        },
      }, 'lentTime'));
    },
    borrowBook(userID, bookID) {
      this.crate({ userID, bookID });
    },
    returnBook(userID, bookID) {
      const history = this.returnBook(userID, bookID);
      if (!history) {
        throw new Error('没找到借书记录');
      } else {
        history.returnBook();
      }
    },
  },
  methods: {
    returnBook() {
      // TODO 非原子判断
      if (['borrowed', 'outdated'].indexOf(this.status) !== -1) {
        this.update({
          status: 'returned',
          returnTime: new Date(),
        });
      }
    },
  },
});

export default HistoryModel;
