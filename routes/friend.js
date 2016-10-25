var express = require('express');
var db = require('../util/db.js');
var router = express.Router();

router.post('/list', function(req, res){

  var queryData = 'SELECT user.userid, user.nickname, user.userprofileimage, user.online ';
  queryData += 'FROM user ';
  queryData += 'WHERE userid IN ';
  queryData += '(SELECT user_member_list FROM member WHERE bee_member_list = ?)';

  db.query(queryData, req.body.beeID, function (err, results) {
      if (err) {
        res.sendStatus(500);
      }
      res.json(results);
  });
});

router.get('/form/:bee_room', function(req, res){
  res.render('friend_add_form');
});

router.post('/search', function(req, res){

  var queryData = 'SELECT userid, nickname, userprofileimage ';
  queryData += 'FROM user ';
  queryData += 'WHERE userid = ? ';

  db.query(queryData, req.body.friendSearch, function (err, results) {
      if (err) {
        res.send(500);
      }
      res.json(results);
  });

});

router.get('/add/:result', function(req, res){

  var friend = {
    user_member_list: req.user.userid,
    bee_member_list: req.params.result
  };

  var queryData = 'INSERT INTO member SET ?';

  db.query(queryData, friend, function (err, results) {
      if (err) {
        res.sendStatus(500);
      }
      res.redirect('/main');
  });
});


module.exports = router;
