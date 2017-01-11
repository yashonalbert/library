import _ from 'lodash';
import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';

const UserModel = sequelize.define('user', {
  corpUserID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  department: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  position: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  mobile: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  weixinID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  indexes: [{
    unique: true,
    fields: ['corpUserID'],
  }],
  instanceMethods: {
    getLentRecord() {
      return sequelize.model('record').getLentRecord(this.id);
    },
    lentBook(bookID) {
      return sequelize.model('book').getStock(bookID).then((stock) => {
        if (stock <= 0) {
          throw new Error('没书了');
        }
        return sequelize.model('record').lentBook(this.id, bookID);
      });
    },
    returnBook(bookID) {
      return sequelize.model('record').returnBook(this.id, bookID);
    },
    sendNotification(template, ...args) {
      if (template === 'borrowBook') {
        const bookID = _.first(args);
        // TODO: 发往微信
      }
    },
  },
});

export default UserModel;
