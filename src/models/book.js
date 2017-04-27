/* eslint-disable max-len */

import _ from 'lodash';
import fs from 'fs';
import Promise from 'bluebird';
import request from 'request-promise';
import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';

const BookModel = sequelize.define('book', {
  doubanID: Sequelize.STRING,
  isbn: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subtitle: Sequelize.STRING,
  origin_title: Sequelize.STRING,
  author: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  translator: Sequelize.STRING,
  alt: Sequelize.STRING,
  image: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  numRaters: Sequelize.STRING,
  averageRating: Sequelize.STRING,
  pubdate: Sequelize.STRING,
  publisher: Sequelize.STRING,
  price: Sequelize.STRING,
  summary: Sequelize.STRING,
  totalNum: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: 'existence',
  },
}, {
  indexes: [{
    unique: true,
    fields: ['doubanID'],
  }],
  classMethods: {
    multiple(path) {
      let results = fs.readFileSync(`./${path}`, 'utf-8');
      results = _.compact(results.split(/\n/g));
      const items = results.map((result) => {
        if (result.indexOf(',') !== -1) {
          result = result.split(',');
          return {
            isbn: result[0],
            num: Number(result[1]),
          };
        }
        return {
          isbn: result,
          num: 1,
        };
      });
      return sequelize.transaction((t) => Promise.all(items.map((item) => this.findOne({ where: { isbn: item.isbn } }).then((old) => {
        if (_.isNull(old)) {
          return sequelize.model('queue').findOne({ where: { isbn: item.isbn } }).then((queue) => {
            if (_.isNull(queue)) {
              return sequelize.model('queue').create(item, { transaction: t });
            }
            queue.num += item.num;
            return queue.update({ num: queue.num }, { transaction: t });
          });
        }
        if (old.status === 'inexistence') {
          return old.update({ status: 'existence', totalNum: item.num }, { transaction: t });
        }
        return old.update({ totalNum: old.totalNum + item.num }, { transaction: t });
      }))));
    },
    getBookByStatus(keyWord, status, page) {
      let where;
      if (status === 'existence') {
        status = 'existence';
      } else if (status === 'inexistence') {
        status = 'inexistence';
      } else {
        return Promise.reject({
          message: 'invalid status',
          statusCode: 400,
          status: 400,
        });
      }
      if (_.isEmpty(keyWord)) {
        where = { status };
      } else {
        where = {
          status,
          $or: [{
            isbn: { $like: `%${keyWord}%` },
          }, {
            title: { $like: `%${keyWord}%` },
          }, {
            subtitle: { $like: `%${keyWord}%` },
          }, {
            origin_title: { $like: `%${keyWord}%` },
          }, {
            author: { $like: `%${keyWord}%` },
          }, {
            translator: { $like: `%${keyWord}%` },
          }, {
            publisher: { $like: `%${keyWord}%` },
          }],
        };
      }
      return this.findAll({
        where,
        offset: (page - 1) * 10,
        limit: 10,
        order: [['title', 'ASC']],
      });
    },
    getBookCount(keyWord, status) {
      let where;
      if (status === 'existence') {
        status = 'existence';
      } else if (status === 'inexistence') {
        status = 'inexistence';
      } else {
        return Promise.reject({
          message: 'invalid status',
          statusCode: 400,
          status: 400,
        });
      }
      if (_.isEmpty(keyWord)) {
        where = { status };
      } else {
        where = {
          status,
          $or: [{
            isbn: { $like: `%${keyWord}%` },
          }, {
            title: { $like: `%${keyWord}%` },
          }, {
            subtitle: { $like: `%${keyWord}%` },
          }, {
            origin_title: { $like: `%${keyWord}%` },
          }, {
            author: { $like: `%${keyWord}%` },
          }, {
            translator: { $like: `%${keyWord}%` },
          }, {
            publisher: { $like: `%${keyWord}%` },
          }],
        };
      }
      return this.count({ where });
    },
    getBook(bookID) {
      return this.findOne({
        where: {
          $or: [{
            id: bookID,
          }, {
            isbn: bookID,
          }],
        },
      });
    },
    requestBook(isbn) {
      return request({
        uri: `https://api.douban.com/v2/book/isbn/${isbn}`,
        json: true,
      }).then((parsedBody) => {
        const book = {
          doubanID: parsedBody.id,
          isbn: parsedBody.isbn13,
          title: parsedBody.title,
          origin_title: parsedBody.origin_title,
          subtitle: parsedBody.subtitle,
          alt: parsedBody.alt,
          image: parsedBody.image,
          author: parsedBody.author.toString(),
          translator: parsedBody.translator.toString(),
          publisher: parsedBody.publisher,
          pubdate: parsedBody.pubdate,
          numRaters: parsedBody.rating.numRaters,
          averageRating: parsedBody.rating.average,
          price: parsedBody.price,
          summary: parsedBody.summary,
        };
        return book;
      });
    },
    setBook(book, action) {
      return this.findOne({
        where: {
          isbn: book.isbn,
        },
      }).then((old) => {
        if (!_.isNull(old) && ['update', 'auto', 'manual'].includes(action)) {
          if (old.status === 'inexistence') {
            return old.update({ status: 'existence', totalNum: book.totalNum });
          }
          if (action === 'update') {
            return sequelize.model('record').getLentBooksCount(old.id).then((recordCount) => {
              if (book.totalNum >= recordCount) {
                return old.update(book);
              }
              return Promise.reject({
                message: 'stock over limit',
                statusCode: 400,
                status: 400,
              });
            });
          }
          book.totalNum += old.totalNum;
          return old.update(book);
        } else if (['auto', 'manual'].includes(action)) {
          return sequelize.model('queue').findOne({ where: { isbn: book.isbn } }).then((queue) => {
            if (_.isNull(queue)) {
              return this.create(book);
            }
            return queue.destroy().then(() => this.create(book));
          });
        }
        return Promise.reject({
          message: 'invalid action',
          statusCode: 400,
          status: 400,
        });
      });
    },
    getStock(bookID) {
      return this.findById(bookID).then((book) => {
        if (_.isNull(book)) {
          return 0;
        }
        return sequelize.model('record').count({
          where: {
            bookID,
            status: {
              in: ['lent', 'outdated'],
            },
          },
        }).then(recordCount => book.totalNum - recordCount);
      });
    },
  },
  instanceMethods: {
    getStock() {
      // TODO 直接查 record 可以减少一次查询
      return this.constructor.getStock(this.id);
    },
    changeStatus(action) {
      if (action === 'delete') {
        return sequelize.model('record').getLentBooksCount(this.id).then((lentCount) => {
          if (lentCount > 0) {
            return Promise.reject({
              message: 'lentCount > 0',
              statusCode: 400,
              status: 400,
            });
          }
          return this.update({ status: 'inexistence' });
        });
      } else if (action === 'recovery') {
        return this.update({ status: 'existence' });
      }
      return Promise.reject({
        message: 'invalid action',
        statusCode: 400,
        status: 400,
      });
    },
  },
});

export default BookModel;
