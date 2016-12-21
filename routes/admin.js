const express = require('express');
const router = express.Router();
const _ = require('lodash');
const utils = require('../utils');
const {AdminGroup, AdminUser} = require('../schema');

router.param('data_id', function(req, res, next, data_id) {
  req.data_id = data_id;
  next();
});

router.get('/login', function(req, res) {
  res.render('web/login');
});

router.post('/login', function(req, res) {
  AdminUser.findOne({username: req.body.username}, function(error, adminUserObj){
    if (adminUserObj) {
      if (utils.hashPassword(result.salt, req.body.password) === adminUserObj.password) {
        res.render('web/adminGroup');
      } else {
        res.send('密码错误');
      }
    } else {
      res.send('用户名不存在');
    }
  });
});

router.get('/adminGroup', function(req, res) {
  AdminGroup.find('', function(error, adminGroupList){
    res.render('web/adminGroup', {
      adminGroupList: adminGroupList
    });
  });
});

router.post('/changeAdminGroup', function(req, res) {
  let newAdminGroup = _.pick(req.body, ['groupname', 'permissions']);
  AdminGroup.findOneAndUpdate({
    groupname: req.body.groupname
  }, newAdminGroup, function(error, adminGroupObj){
    if (!adminGroupObj) {
      AdminGroup.create(newAdminGroup, function(error){
        res.redirect('adminGroup');
      });
    } else {
      res.redirect('adminGroup');
    }
  });
});

router.get('/:data_id/removeAdminGroup', function(req, res) {
  AdminGroup.remove({_id: req.data_id}, function(error){
    res.redirect('/admin/adminGroup');
  });
});

router.get('/adminUser', function(req, res) {
  AdminUser.find('').populate('group', 'groupname').exec(function(error, adminUserList){
    AdminGroup.find('', function(error, adminGroupList){
      res.render('web/adminUser', {
        adminUserList: adminUserList,
        adminGroupList: adminGroupList
      });
    });
  });
});

router.post('/changeAdminUser', function(req, res) {
  AdminGroup.findOne({groupname: req.body.group}, function(error, adminGroupObj){
    let newAdminUser = _.pick(req.body, ['username','nickname','email']);
    newAdminUser.group = adminGroupObj._id;
    newAdminUser.salt = utils.randomString(5);
    newAdminUser.password = utils.hashPassword(newAdminUser.salt, req.body.password);
    AdminUser.findOneAndUpdate({
      username: req.body.username
    }, newAdminUser, function(error, adminUserObj){
      if (!adminUserObj) {
        AdminUser.create(newAdminUser, function(error){
          res.redirect('adminUser');
        });
      } else {
        res.redirect('adminUser');
      }
    });
  });
});

router.get('/:data_id/removeAdminUser', function(req, res) {
  AdminUser.remove({_id: req.data_id}, function(error){
    res.redirect('/admin/adminUser');
  });
});

module.exports = router;
