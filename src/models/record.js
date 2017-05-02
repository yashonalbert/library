import _ from 'lodash';
import Promise from 'bluebird';
import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';
import wechat from '../utils/wechat';
import config from '../utils/config';

const RecordModel = sequelize.define('record', {
  lentTime: Sequelize.DATE,
  noticTime: Sequelize.DATE,
  expiryTime: Sequelize.DATE,
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
        return Promise.reject({
          message: 'invalid status',
          statusCode: 400,
          status: 400,
        });
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
        return Promise.reject({
          message: 'invalid status',
          statusCode: 400,
          status: 400,
        });
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
    getRecordCount(keyWord, status) {
      if (status === 'confirming') {
        status = 'confirming';
      } else if (status === 'lent') {
        status = { in: ['lent', 'returned', 'outdated'] };
      } else {
        return Promise.reject({
          message: 'invalid status',
          statusCode: 400,
          status: 400,
        });
      }
      if (_.isEmpty(keyWord)) {
        return this.count({ where: { status } });
      }
      return this.count({
        include: [{
          model: sequelize.model('user'),
          as: 'user',
          where: { name: keyWord },
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
          return Promise.reject({
            message: 'book not found',
            statusCode: 400,
            status: 400,
          });
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
            return Promise.reject({
              message: 'invalid book or user',
              statusCode: 400,
              status: 400,
            });
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
          return Promise.reject({
            message: 'record not found',
            statusCode: 400,
            status: 400,
          });
        }
        return record.returnBook();
      });
    },
    sendNotification(template, data) {
      const to = { touser: '' };
      const message = {
        msgtype: 'news',
        safe: '0',
      };
      if (template === 'expiryBefore') {
        to.touser = data.user.corpUserID;
        const articles = [{
          title: `【还书提醒】《${data.book.title}》`,
          description: '您有书籍将在3天后到期，请及时还书。',
          url: `http://${config.domain}/#/records/${data.id}`,
          picurl: data.book.image,
        }];
        message.news = { articles };
      } else if (template === 'expiryAfter') {
        to.touser = data.user.corpUserID;
        const articles = [{
          title: `【还书提醒】《${data.book.title}》`,
          description: '您有书籍已经到期，请及时还书。',
          url: `http://${config.domain}/#/records/${data.id}`,
          picurl: data.book.image,
        }];
        message.news = { articles };
      } else {
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
          if (_.isEmpty(users)) {
            return Promise.resolve();
          }
          if (template === 'lendBook') {
            to.touser = users;
            const articles = [{
              title: `【借阅申请】《${data.book.title}》`,
              description: `借阅人：${data.user.name}`,
              url: `http://${config.domain}/#/records/all`,
              picurl: data.book.image,
            }];
            message.news = { articles };
            return Promise.promisify(wechat.send, { context: wechat })(to, message);
          }
          if (template === 'recommend') {
            to.touser = users;
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
            return Promise.promisify(wechat.send, { context: wechat })(to, message);
          }
          return Promise.reject({
            message: 'invalid template',
            statusCode: 400,
            status: 400,
          });
        });
      }
      return Promise.promisify(wechat.send, { context: wechat })(to, message);
    },
  },
  instanceMethods: {
    returnBook() {
      // TODO 非原子判断
      if (['lent', 'outdated'].includes(this.status)) {
        return this.update({
          status: 'returned',
          noticTime: null,
          returnTime: new Date(),
        });
      }
      return Promise.reject({
        message: 'invalid returnBook',
        statusCode: 400,
        status: 400,
      });
    },
    confirm(action) {
      // TODO 非原子判断
      if (this.status === 'confirming' && ['rejected', 'allowed'].includes(action)) {
        let actionPromise;
        if (action === 'rejected') {
          actionPromise = this.update({ status: 'rejected' });
        } else {
          const now = new Date();
          const notic = now.valueOf() + (27 * 24 * 60 * 60 * 1000);
          const expiry = now.valueOf() + (30 * 24 * 60 * 60 * 1000);
          actionPromise = this.update({
            status: 'lent',
            lentTime: new Date(),
            noticTime: new Date(notic),
            expiryTime: new Date(expiry),
          });
        }
        return actionPromise;
      }
      return Promise.reject({
        message: 'invalid confirm',
        statusCode: 400,
        status: 400,
      });
    },
  },
});

export default RecordModel;
