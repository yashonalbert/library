import _ from 'lodash';
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
    getBookByStatus(keyWord, status, page) {
      let where;
      if (status === 'existence') {
        status = 'existence';
      } else if (status === 'inexistence') {
        status = 'inexistence';
      } else {
        return Promise.resolve('invalid status');
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
        return Promise.resolve('invalid status');
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
          if (action === 'update') {
            return sequelize.model('record').getLentBooksCount(old.id).then((recordCount) => {
              if (book.totalNum >= recordCount) {
                return old.update(book);
              }
              return Promise.resolve('stock over limit');
            });
          }
          book.totalNum += old.totalNum;
          return old.update(book);
        } else if (['auto', 'manual'].includes(action)) {
          return this.create(book);
        }
        return Promise.resolve('invalid action');
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
            return Promise.resolve('lentCount > 0');
          }
          return this.update({ status: 'inexistence' });
        });
      } else if (action === 'recovery') {
        return this.update({ status: 'existence' });
      }
      return Promise.resolve('invalid action');
    },
  },
});

export default BookModel;
