import _ from 'lodash';
import Joi from 'joi';
import cado from '../cado';

const UserModel = cado.model('user', {
  corpUserID: Joi.string().required(),
  name: Joi.string().required(),
  department: Joi.array().items(Joi.number()).required(),
  position: Joi.string().required(),
  mobile: Joi.string().required(),
  gender: Joi.number().required(),
  email: Joi.string().required(),
  weixinID: Joi.string().required(),
  avatar: Joi.string().required(),
  status: Joi.number().required(),
}, {
  indexes: {
    unique: ['corpUserID'],
  },
  statics: {

  },
  methods: {
    getLentRecord() {
      return cado.model('record').getLentRecord(this.id);
    },
    lentBook(bookID) {
      const stock = cado.model('book').getStock(bookID);
      if (stock > 0) {
        cado.model('record').lentBook(this.id, bookID);
      } else {
        throw new Error('没书了');
      }
    },
    returnBook(bookID) {
      cado.model('record').returnBook(this.id, bookID);
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
