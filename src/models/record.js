import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';

const RecordModel = sequelize.define('record', {
  lentTime: Sequelize.DATE,
  returnTime: Sequelize.DATE,
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  classMethods: {
    getConfirmingRecord() {
      return this.findAll({
        where: {
          status: 'confirming',
        },
        includes: [sequelize.model('book'), sequelize.model('user')],
      });
    },
    getLentRecord(userID) {
      return this.findAll({
        where: {
          userID,
          status: {
            in: ['lent', 'returned', 'outdated'],
          },
        },
      });
    },
    getLentBooksCount(userID) {
      return this.count({
        where: {
          userID,
          status: {
            in: ['lent', 'outdated'],
          },
        },
      });
    },
    findRecord(userID, bookID) {
      return this.findOne({
        where: {
          userID,
          bookID,
          status: {
            in: ['lent', 'outdated'],
          },
        },
        order: [['lentTime', 'ASC']],
      });
    },
    lentBook(userID, bookID) {
      return this.create({
        userID,
        bookID,
        status: 'confirming',
      });
    },
    returnBook(userID, bookID) {
      this.findRecord(userID, bookID).then((record) => {
        if (!record) {
          throw new Error('没找到借书记录');
        }
        return record.returnBook();
      });
    },
  },
  instanceMethods: {
    returnBook() {
      // TODO 非原子判断
      if (['lent', 'outdated'].includes(this.status)) {
        return this.update({
          status: 'returned',
          returnTime: new Date(),
        });
      }
      return Promise.resolve(0);
    },
    confirm(action) {
      // TODO 非原子判断
      if (this.status === 'confirming' && ['rejected', 'allowed'].includes(action)) {
        let actionPromise;
        if (action === 'rejected') {
          actionPromise = this.update({ status: 'rejected' });
        } else {
          actionPromise = this.update({
            status: 'lent',
            lentTime: new Date(),
          });
        }
        return actionPromise;
      }
      return Promise.resolve(0);
    },
  },
});

export default RecordModel;
