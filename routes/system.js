const express = require('express');
const router = express.Router();
const {AdminGroup, AdminUser, BookList, LendList, Log, User} = require('../schema');

router.get('/log', function(req, res) {
  Log.find('', function(error, logList){
    res.render('web/log', {logList: logList});
  });
});

router.get('/search', function(req, res) {
  let Model, listName;
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
  Model.find(new RegExp(req.query.keyWord), function(error, result){
    let resObj = JSON.parse(`{"${listName}": ""}`);
    resObj[`${listName}`]= result;
    res.render(`web/${routeName}`, resObj);
  });
});

router.get('/user', function(req, res) {
  User.find('', function(error, userList){
    res.render('web/user', {userList: userList});
  });
});

module.exports = router;
