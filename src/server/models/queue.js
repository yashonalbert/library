import Sequelize from 'sequelize';
import sequelize from '../utils/sequelize';

const QueueModel = sequelize.define('queue', {
  isbn: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  num: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  isQueue: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  classMethods: {

  },
});

export default QueueModel;
