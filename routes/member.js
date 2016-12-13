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
        // check member of bee
        var queryData = 'SELECT user_member FROM member ';
        queryData += 'WHERE user_member = ? ';
        queryData += 'AND bee_member = ? ';

        db.query(queryData, [req.body.memberID, req.body.beeID], function (err, isThereUser) {
            if (err) throw err;
            callback(null, isThereUser)
        });
      }
  ],
  function(err, isThereUser){
    if (err) throw err;

    if (isThereUser == '') {
      // there is no member in bee..so you can invite
      var member = {
        user_member: req.body.memberID,
        bee_member: req.body.beeID
      };

      var queryData = 'INSERT INTO member SET ?';
      db.query(queryData, member, function (err, results) {
          if (err) throw err;
          res.json(true);
      });
    }else{
      // already exist in bee. you can't invite
      res.json(false);
    }
  }); // async
});

module.exports = router;
