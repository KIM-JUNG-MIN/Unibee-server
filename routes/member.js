var express = require('express');
var db = require('../util/db.js');
var async = require('async');
var router = express.Router();

router.post('/list', function(req, res){

  var queryData = 'SELECT user.userid, user.nickname, user.userprofileimage, member.user_online ';
  queryData += 'FROM user, bee, member ';
  queryData += 'WHERE bee.bee_id = member.bee_member ';
  queryData += 'AND user.userid = member.user_member ';
  queryData += 'AND bee.bee_id = ? ';

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

  db.query(queryData, req.body.memberSearch, function (err, results) {
      if (err) {
        res.send(500);
      }
      res.json(results);
  });

});

router.post('/add', function(req, res){

  async.waterfall([
      function(callback){

        var member = {
          user_member: req.body.memberID,
          bee_member: req.body.beeID
        };
        console.log(member);
        
        var queryData = 'SELECT user_member FROM member';
        queryData += 'WHERE user_member = ? ';
        queryData += 'AND bee_member = ? ';

        db.query(queryData, [req.body.memberID, req.body.beeID], function (err, results) {
            if (err) throw err;
            callback(null, results);
        });
      }
  ],
  function(err, imageURL){
    res.json(imageURL);
    console.log(imageURL);
  }); // async

  // var member = {
  //   user_member: req.body.memberID,
  //   bee_member: req.body.beeID
  // };
  //
  //   res.json(member);
  //   console.log(member);
  //
  // var queryData = 'INSERT INTO member SET ?';
  //
  // db.query(queryData, friend, function (err, results) {
  //     if (err) {
  //       res.sendStatus(500);
  //     }
  //     res.redirect('/main');
  // });
});


module.exports = router;
