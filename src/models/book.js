import request from 'request-promise';
import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';

const BookModel = sequelize.define('book', {
  doubanID: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
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
  image: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  numRaters: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  averageRating: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  pubdate: Sequelize.STRING,
  publisher: Sequelize.STRING,
  summary: Sequelize.STRING,
  totalNum: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  indexes: [{
    unique: true,
    fields: ['doubanID'],
  }],
  classMethods: {
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
      request({
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
          summary: parsedBody.summary,
        };
        return book;
      });
    },
    getStock(bookID) {
      return this.findById(bookID).then((book) => {
        if (book) {
          return sequelize.model('record').count({
            where: {
              bookID,
              status: {
                in: ['lent', 'outdated'],
              },
            },
          }).then(recordCount => book.totalNum - recordCount);
        }
        return 0;
      });
    },
  },
  instanceMethods: {
    getStock() {
      // TODO 直接查 record 可以减少一次查询
      return this.constructor.getStock(this.id);
    },
  },
});

export default BookModel;
