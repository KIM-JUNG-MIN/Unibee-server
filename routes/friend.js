var express = require('express');
var db = require('../util/db.js');
var router = express.Router();

router.get('/list', function(req, res){

  var queryData = 'SELECT user.userid, user.nickname, user.userprofileimage ';
  queryData += 'FROM user ';
  queryData += 'WHERE userid IN ';
  queryData += '(SELECT friend_id FROM friend WHERE me_id = ?)';

  db.query(queryData, req.user.userid, function (err, results) {
      if (err) {
        res.sendStatus(500);
      }
      res.json(results);
  });
});

router.get('/add', function(req, res){
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
    me_id: req.user.userid,
    friend_id: req.params.result
  }

  var queryData = 'INSERT INTO friend SET ?';

  db.query(queryData, friend, function (err, results) {
      if (err) {
        res.sendStatus(500);
      }
      res.redirect('/main');
  });


});


module.exports = router;
