const express = require('express');
const { AdminUser, BookList, LendList } = require('../schema');

const router = express.Router();

router.get('/bookList', (req, res) => {
  BookList.find('', (error, bookList) => {
    res.render('web/bookList', { bookList });
  });
});

// router.get('/addBookList', function(req, res) {
//
//   BookList.create('', function(error, bookList){
//     res.render('web/bookList', {bookList: bookList});
//   });
// });

router.get('/lendList', (req, res) => {
  LendList.find('', (error, lendList) => {
    res.render('web/lendList', { lendList });
  });
});


module.exports = router;
