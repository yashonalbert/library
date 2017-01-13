import Sequelize from 'sequelize';
import config from './config';

const sequelize = new Sequelize('library', null, null, {
  dialect: 'sqlite',
  storage: config.database,
});

export default sequelize;
