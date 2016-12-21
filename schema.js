const mongoose = require('mongoose');
const config = require('./config.json');
mongoose.connect(config.mongodb);
mongoose.Promise = require('bluebird');

AdminGroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    index: {
      unique :true
    }
  },
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
  open_id: String,
  salt: String,
  email: String,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admingroup'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

BookListSchema = new mongoose.Schema({
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
  id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'booklist'
  },
  user_id: {
    type: String,
    ref: 'user'
  },
  lenddate: {
    type: Date,
    default: Date.now
  },
  returndate: {
    type: Date,
    default: Date.now + 30 * 24 * 60 * 60
  }
});

LogSchema = new mongoose.Schema({
  action : String,
  type : String,
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema = new mongoose.Schema({
  user_id: {
    type:String,
    index: {
      unique :true
    }
  },
  name: String,
  account: String,
  wx: String,
  tel: Number,
  email: String,
  lendbook: Array
});

module.exports = {
  AdminGroup: mongoose.model('admingroup', AdminGroupSchema),
  AdminUser: mongoose.model('adminuser', AdminUserSchema),
  BookList: mongoose.model('book', BookListSchema),
  LendList: mongoose.model('lendlist', LendListSchema),
  Log: mongoose.model('log', LogSchema),
  User: mongoose.model('user', UserSchema)
};
