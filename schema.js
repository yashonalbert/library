const mongoose = require('mongoose');
mongoose.connect(config.mongodb);
mongoose.Promise = require('bluebird');

AdminGroupSchema = new mongoose.Schema({
  name: String,
  permissions: Array,
  date: {
    type: Date,
    default: Date.now
  }
});

AdminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    index: {
      unique :true
    }
  },
  nickname: String,
  password: String,
  salt: String,
  email: String,
  group: {
    type: String,
    ref: 'AdminGroup'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

BookSchema = new mongoose.Schema({
  id: Number,
  isbn10: Number,
  isbn13: Number,
  title: String,
  origin_title: String,
  alt_title: String,
  subtitle: String,
  url: String,
  alt: String,
  image: String,
  author: Array,
  translator: Array,
  publisher: String,
  pubdate: Date,
  tags:[{
    count: Number,
    name: String
  }],
  binding: String,
  price: Number,
  series: {
      id: Number,
      title: String
  },
  pages: Number,
  author_intro: String,
  summary: String,
  catalog: String,
  total: Number,
  surplus: Number
});

LendListSchema = new mongoose.Schema({
  title: String,
  isbn10: Number,
  isbn13: Number,
  lenduser: String,
  lenddate: {
    type: Date,
    default: Date.now
  },
  returndate: {
    type: Date,
    default: Date.now + 30 * 24 * 60 * 60
  }
});

UserSchema = new mongoose.Schema({
  userid: String,
  name: String,
  account: String,
  wx: String,
  tel: Number,
  email: String,
  lendbook: Array
});

LogSchema = new mongoose.Schema({
  type : String,
  date: {
    type: Date,
    default: Date.now
  },
  content : String
});

module.exports = {
  AdminGroup: mongoose.model('admingroup', AdminGroupSchema),
  AdminUser: mongoose.model('adminuser', AdminUserSchema),
  Book: mongoose.model('book', BookSchema),
  LendList: mongoose.model('lendlist', LendListSchema),
  User: mongoose.model('user', UserSchema),
  Log: mongoose.model('log', LogSchema)
};
