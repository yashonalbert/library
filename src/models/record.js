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
    getRecordByStatus(status) {
      if (status === 'confirming') {
        status = 'confirming';
      } else {
        status = { in: ['lent', 'returned', 'outdated'] };
      }
      return this.findAll({
        where: {
          status,
        },
        include: [{
          model: sequelize.model('book'),
          as: 'book',
        }, {
          model: sequelize.model('user'),
          as: 'user',
        }],
      });
    },
    getLentRecord(userID) {
      return this.findAll({
        where: {
          userID,
          status: {
            in: ['lent', 'outdated'],
          },
        },
        include: [{
          model: sequelize.model('book'),
          as: 'book',
        }, {
          model: sequelize.model('user'),
          as: 'user',
        }],
      });
    },
    getLentBooksCount(bookID) {
      return this.count({
        where: {
          bookID,
          status: {
            in: ['lent', 'outdated'],
          },
        },
      });
    },
    getRecordById(recordID) {
      return this.findById(recordID, {
        include: [{
          model: sequelize.model('book'),
          as: 'book',
        }, {
          model: sequelize.model('user'),
          as: 'user',
        }],
      });
    },
    getRecordByISBN(isbn) {
      return sequelize.model('book').getBook(isbn).then(book => this.findAll({
        where: {
          bookID: book.id,
          status: {
            in: ['lent', 'outdated'],
          },
        },
        include: [{
          model: sequelize.model('book'),
          as: 'book',
        }, {
          model: sequelize.model('user'),
          as: 'user',
        }],
        order: [['lentTime', 'ASC']],
      }));
    },
    lentBook(userID, bookID) {
      return this.create({
        userID,
        bookID,
        status: 'confirming',
      });
    },
    returnBook(recordID) {
      return this.getRecordById(recordID).then(record => record.returnBook());
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
