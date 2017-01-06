const express = require('express');
const _ = require('lodash');
const utils = require('../utils');
const { AdminGroup, AdminUser } = require('../schema');

const router = express.Router();

router.param('data_id', (req, res, next, data_id) => {
  req.data_id = data_id;
  next();
});

router.get('/login', (req, res) => {
  res.render('web/login');
});

router.post('/login', (req, res) => {
  AdminUser.findOne({ username: req.body.username }, (error, adminUserObj) => {
    if (adminUserObj) {
      if (utils.hashPassword(adminUserObj.salt, req.body.password) === adminUserObj.password) {
        res.redirect('adminGroup');
      } else {
        res.send('密码错误');
      }
    } else {
      res.send('用户名不存在');
    }
  });
});

router.get('/adminGroup', (req, res) => {
  AdminGroup.find('', (error, adminGroupList) => {
    res.render('web/adminGroup', {
      adminGroupList,
    });
  });
});

router.post('/changeAdminGroup', (req, res) => {
  const newAdminGroup = _.pick(req.body, ['groupname', 'permissions']);
  AdminGroup.findOneAndUpdate({
    groupname: req.body.groupname,
  }, newAdminGroup, (error, adminGroupObj) => {
    if (!adminGroupObj) {
      AdminGroup.create(newAdminGroup, (error) => {
        res.redirect('adminGroup');
      });
    } else {
      res.redirect('adminGroup');
    }
  });
});

router.get('/:data_id/removeAdminGroup', (req, res) => {
  AdminGroup.remove({ _id: req.data_id }, (error) => {
    res.redirect('/admin/adminGroup');
  });
});

router.get('/adminUser', (req, res) => {
  AdminUser.find('').populate('group', 'groupname').exec((error, adminUserList) => {
    AdminGroup.find('', (error, adminGroupList) => {
      res.render('web/adminUser', {
        adminUserList,
        adminGroupList,
      });
    });
  });
});

router.post('/changeAdminUser', (req, res) => {
  AdminGroup.findOne({ groupname: req.body.group }, (error, adminGroupObj) => {
    const newAdminUser = _.pick(req.body, ['username', 'nickname', 'email']);
    newAdminUser.group = adminGroupObj._id;
    newAdminUser.salt = utils.randomString(5);
    newAdminUser.password = utils.hashPassword(newAdminUser.salt, req.body.password);
    AdminUser.findOneAndUpdate({
      username: req.body.username,
    }, newAdminUser, (error, adminUserObj) => {
      if (!adminUserObj) {
        AdminUser.create(newAdminUser, (error) => {
          res.redirect('adminUser');
        });
      } else {
        res.redirect('adminUser');
      }
    });
  });
});

router.get('/:data_id/removeAdminUser', (req, res) => {
  AdminUser.remove({ _id: req.data_id }, (error) => {
    res.redirect('/admin/adminUser');
  });
});

module.exports = router;
