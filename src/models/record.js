import _ from 'lodash';
import Joi from 'joi';
import cado from '../utils/cado';

const RecordModel = cado.model('record', {
  userID: Joi.string().required(),
  bookID: Joi.number().required(),
  lentTime: Joi.date(),
  returnTime: Joi.date(),
  status: Joi.string().valid('confirming', 'rejected', 'lent', 'returned', 'outdated').default('confirming'),
}, {
  indexes: {
    indices: ['userID', 'bookID', 'status'],
  },
  foreignKeys: {
    userID: 'user',
    bookID: 'book',
  },
  statics: {
    getConfirmingRecord() {
      return this.find({
        status: 'confirming',
      });
    },
    getLentRecord(userID) {
      return this.find({
        userID,
        status: {
          $in: ['lent', 'returned', 'outdated'],
        },
      });
    },
    getLentBooksCount(userID) {
      return this.count({
        userID,
        status: {
          $in: ['lent', 'outdated'],
        },
      });
    },
    findRecord(userID, bookID) {
      return _.first(this.findBySort({
        userID,
        bookID,
        status: {
          $in: ['lent', 'outdated'],
        },
      }, 'lentTime'));
    },
    lentBook(userID, bookID) {
      this.crate({ userID, bookID });
    },
    returnBook(userID, bookID) {
      const record = this.returnBook(userID, bookID);
      if (!record) {
        throw new Error('没找到借书记录');
      } else {
        record.returnBook();
      }
    },
  },
  methods: {
    returnBook() {
      // TODO 非原子判断
      if (['lent', 'outdated'].includes(this.status)) {
        this.update({
          status: 'returned',
          returnTime: new Date(),
        });
      }
    },
    confirm(action) {
      // TODO 非原子判断
      if (this.status === 'confirming' && ['rejected', 'allowed'].includes(action)) {
        if (action === 'rejected') {
          this.update({ status: 'rejected' });
        } else {
          this.update({
            status: 'lent',
            lentTime: new Date(),
          });
        }
      }
    },
  },
});

export default RecordModel;
