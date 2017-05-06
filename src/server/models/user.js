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
  position: Sequelize.STRING,
  mobile: Sequelize.STRING,
  gender: Sequelize.STRING,
  email: Sequelize.STRING,
  weixinID: Sequelize.STRING,
  avatar: Sequelize.STRING,
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'on',
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
    messageSet(status) {
      if (status === 'on') {
        return this.update({ message: 'on' });
      } else if (status === 'off') {
        return this.update({ message: 'off' });
      }
      return Promise.reject({
        message: 'invalid status',
        statusCode: 400,
        status: 400,
      });
    },
    getLentRecord() {
      return sequelize.model('record').getLentRecord(this.id);
    },
    lentValidation(bookID) {
      return this.getLentRecord().then((records) => {
        if (records.map((record) => record.status).includes('outdated')) {
          return {
            desc: '有逾期书籍未还',
            validation: false,
          };
        } else if (records.length >= 2) {
          return {
            desc: '超过最大借阅数两本',
            validation: false,
          };
        }
        return sequelize.model('book').getStock(bookID);
      }).then((stock) => {
        if (stock <= 0) {
          return {
            desc: '剩余库存0本',
            validation: false,
          };
        }
        return {
          desc: `剩余库存${stock}本`,
          validation: true,
        };
      });
    },
  },
});

export default UserModel;
