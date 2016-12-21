const express = require('express');
const router = express.Router();
const {AdminUser, BookList, LendList} = require('../schema');

router.get('/bookList', function(req, res) {
  BookList.find('', function(error, bookList){
    res.render('web/bookList', {bookList: bookList});
  });
});

// router.get('/addBookList', function(req, res) {
//
//   BookList.create('', function(error, bookList){
//     res.render('web/bookList', {bookList: bookList});
//   });
// });

router.get('/lendList', function(req, res) {
  LendList.find('', function(error, lendList){
    res.render('web/lendList', {lendList: lendList});
  });
});


module.exports = router;
