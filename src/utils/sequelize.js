import Sequelize from 'sequelize';

const { config } = global.app;

const sequelize = new Sequelize('library', null, null, {
  dialect: 'sqlite',
  storage: config.database,
});

export default sequelize;
