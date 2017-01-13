import sequelize from '../utils/sequelize';
import RecordModel from './record';
import BookModel from './book';
import UserModel from './user';

// book 拥有很多 record
BookModel.hasMany(RecordModel, {
  foreignKey: 'bookID',
  constraints: false,
});
RecordModel.belongsTo(BookModel, {
  foreignKey: 'bookID',
  constraints: false,
  as: 'book',
});

UserModel.hasMany(RecordModel, {
  foreignKey: 'userID',
  constraints: false,
});
RecordModel.belongsTo(UserModel, {
  foreignKey: 'userID',
  constraints: false,
  as: 'user',
});

export { RecordModel, BookModel, UserModel, sequelize };
