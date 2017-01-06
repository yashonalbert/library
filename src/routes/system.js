const express = require('express');
const { AdminGroup, AdminUser, BookList, LendList, Log, User } = require('../schema');

const router = express.Router();

router.get('/log', (req, res) => {
  Log.find('', (error, logList) => {
    res.render('web/log', { logList });
  });
});

router.get('/search', (req, res) => {
  let Model;
  let listName;
  let routeName;
  switch (req.query.searchClass) {
    case ('管理员组'):
      Model = AdminGroup;
      listName = 'adminGroupList';
      routeName = 'adminGroup';
      break;
    case ('管理员'):
      Model = AdminUser;
      listName = 'adminGroupList';
      routeName = 'adminGroup';
      break;
    case ('图书清单'):
      Model = BookList;
      listName = 'bookList';
      routeName = 'bookList';
      break;
    case ('借出清单'):
      Model = LendList;
      listName = 'lendList';
      routeName = 'lendList';
      break;
    case ('系统日志'):
      Model = Log;
      listName = 'logList';
      routeName = 'log';
      break;
    case ('用户管理'):
      Model = User;
      listName = 'userList';
      routeName = 'user';
      break;
    default:
  }
  Model.find(new RegExp(req.query.keyWord), (error, result) => {
    const resObj = JSON.parse(`{"${listName}": ""}`);
    resObj[`${listName}`] = result;
    res.render(`web/${routeName}`, resObj);
  });
});

router.get('/user', (req, res) => {
  User.find('', (error, userList) => {
    res.render('web/user', { userList });
  });
});

module.exports = router;
