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
    allowNull: true,
  },
  mobile: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  weixinID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true,
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
    lentValidation(bookID) {
      return this.getLentRecord().then((records) => {
        if (records.map(record => record.getDataValue('status')).indexOf('outdated') !== -1) {
          return Promise.resolve({ desc: '有逾期书籍未还', validation: false });
        } else if (records.length >= 2) {
          return Promise.resolve({ desc: '超过最大借阅数两本', validation: false });
        }
        return sequelize.model('book').getStock(bookID).then((stock) => {
          if (stock <= 0) {
            return Promise.resolve({ desc: '剩余库存0本', validation: false });
          }
          return Promise.resolve({ desc: `剩余库存${stock}本`, validation: true });
        });
      });
    },
    lentBook(bookID) {
      return sequelize.model('record').lentBook(this.id, bookID);
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
