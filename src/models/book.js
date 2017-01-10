import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';

const BookModel = sequelize.define('project', {
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
    getStock(bookID) {
      this.findById(bookID).then((book) => {
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
