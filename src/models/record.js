import _ from 'lodash';
import Promise from 'bluebird';
import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';
import wechat from '../utils/wechat';
import config from '../utils/config';

const RecordModel = sequelize.define('record', {
  lentTime: Sequelize.DATE,
  returnTime: Sequelize.DATE,
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  classMethods: {
    searchRecords(keyWord, status, page) {
      if (status === 'confirming') {
        status = 'confirming';
      } else if (status === 'lent') {
        status = { in: ['lent', 'returned', 'outdated'] };
      } else {
        return Promise.resolve('invalid status');
      }
      return this.findAll({
        offset: (page - 1) * 10,
        limit: 10,
        order: [['lentTime', 'DESC']],
        include: [{
          model: sequelize.model('book'),
          as: 'book',
        }, {
          model: sequelize.model('user'),
          as: 'user',
          where: { name: keyWord },
        }],
      });
    },
    getRecordByStatus(status, page) {
      if (status === 'confirming') {
        status = 'confirming';
      } else if (status === 'lent') {
        status = { in: ['lent', 'returned', 'outdated'] };
      } else {
        return Promise.resolve('invalid status');
      }
      return this.findAll({
        where: { status },
        offset: (page - 1) * 10,
        limit: 10,
        order: [['lentTime', 'DESC']],
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
      return sequelize.model('book').getBook(isbn).then((book) => {
        if (_.isNull(book)) {
          return Promise.resolve('book not found');
        }
        return this.findAll({
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
        });
      });
    },
    validRecord(userID, bookID) {
      let validBook;
      let validUser;
      return sequelize.model('book').findById(bookID).then((book) => {
        if (_.isNull(book)) {
          validBook = false;
        } else {
          validBook = true;
        }
        return sequelize.model('user').findById(userID);
      }).then((user) => {
        if (_.isNull(user)) {
          validUser = false;
        } else {
          validUser = true;
        }
        if (validBook === true && validUser === true) {
          return 'valid';
        }
        return 'invalid';
      });
    },
    lentBook(userID, bookID) {
      const recordDoc = {
        userID,
        bookID,
        status: 'confirming',
      };
      return this.findOne({ where: recordDoc }).then((old) => {
        if (_.isNull(old)) {
          return this.validRecord(userID, bookID).then((valid) => {
            if (valid === 'valid') {
              return this.create(recordDoc);
            }
            return Promise.resolve('invalid book or user');
          });
        }
        return old.update({ updatedAt: new Date() });
      }).then(record => this.findOne({
        where: {
          id: record.id,
        },
        include: [{
          model: sequelize.model('book'),
          as: 'book',
        }, {
          model: sequelize.model('user'),
          as: 'user',
        }],
      })).then(record => this.sendNotification('lendBook', record));
    },
    returnBook(recordID) {
      return this.getRecordById(recordID).then((record) => {
        if (_.isNull(record)) {
          return Promise.resolve('record not found');
        }
        return record.returnBook();
      });
    },
    sendNotification(template, data) {
      const to = { touser: '' };
      const message = { safe: '0' };
      return sequelize.model('user').findAll({
        where: {
          message: 'on',
          role: 'admin',
        },
      }).then((users) => {
        users = users.map((user) => {
          user = user.toJSON();
          return user.corpUserID;
        });
        users = users.join('|');
        if (template === 'lendBook') {
          to.touser = users;
          message.msgtype = 'text';
          const content =
            `${data.user.name}申请借阅《${data.book.title}》<a href="http://${config.domain}/#/records/all">点击进入授权页</a>`;
          message.text = { content };
        }
        if (template === 'recommend') {
          to.touser = users;
          message.msgtype = 'news';
          const info = _.compact(_.values(_.pick(data, [
            'subtitle', 'origin_title', 'author', 'translator', 'publisher', 'pubdate', 'isbn',
          ]))).join(' / ');
          const articles = [{
            title: `【图书推荐】${data.title}`,
            description: info,
            url: data.alt,
            picurl: data.image,
          }];
          message.news = { articles };
        }
        return Promise.promisify(wechat.send, { context: wechat })(to, message);
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
      return Promise.resolve('invalid returnBook');
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
      return Promise.resolve('invalid confirm');
    },
  },
});

export default RecordModel;
