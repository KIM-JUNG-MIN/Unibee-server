var express = require('express');
var shortid = require('shortid');
var async = require('async');
var db = require('../util/db.js');

var fs = require('fs');
var formidable = require('formidable');
var AWS = require('aws-sdk');

var router = express.Router();


AWS.config.region = 'ap-northeast-1';


var express = require('express');
var shortid = require('shortid');
var async = require('async');
var db = require('../util/db.js');

var fs = require('fs');
var formidable = require('formidable');
var AWS = require('aws-sdk');

var router = express.Router();

AWS.config.region = 'ap-northeast-1';

router.get('/new', function(req, res){
  res.render('bee_new_form');
});

router.post('/new', function(req, res){
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    var s3 = new AWS.S3();

    async.waterfall([
        function(callback){
            if (files.beethumbnail.name  != '') {
                 var params = {
                   'Bucket':'unibee/beethumbnail',
                   'Key': fields.bee_title + '_thumbnail',
                   'ACL':'public-read',
                   'Body': fs.createReadStream(files.beethumbnail.path),
                   'ContentType':files.beethumbnail.type
                 }

                 s3.upload(params, function(err, data) {
                     if (err) throw err;
                     var image_yes = 'https://s3-ap-northeast-1.amazonaws.com/unibee/beethumbnail/' + fields.bee_title + '_thumbnail';
                     return callback(null, image_yes);
                 });

            }else{
                var image_no = 'https://s3-ap-northeast-1.amazonaws.com/unibee/beethumbnail/bee_default.png';
                return callback(null, image_no);
            }
        },
        function (imageURL, callback) {

          var bee = {
            bee_id: shortid.generate(),
            bee_title: fields.bee_title,
            bee_description: fields.bee_description,
            bee_thumbnail: imageURL
          };

          var queryData1 = 'INSERT INTO bee SET ?';
          db.query(queryData1, bee , function(err, result){
            if (err) {
              console.log('create bee fail');
              return callback(err);
            }
            return callback(null, bee.bee_id);
          });

        }],
        function(err, beeid){
          if (err) throw err;

          var member = {
            user_member: req.user.userid,
            bee_member: beeid
          };

          var queryData2 = 'INSERT INTO member SET ?';
          db.query(queryData2, member , function(err, result){
            if (err) {
              console.log('new bee of member fail');
              res.status(500);
            } else {
              res.redirect('/');
            }
          }); // db
    }); // async
  });
  //form.parse
});

router.get('/list', function(req, res){

  var queryData = 'SELECT bee.bee_id, bee.bee_title, bee.bee_description, bee.bee_thumbnail ';
  queryData += 'FROM bee, user, member ';
  queryData += 'WHERE bee.bee_id = member.bee_member ';
  queryData += 'AND user.userid = member.user_member ';
  queryData += 'AND user.userid = ? ';

  db.query(queryData, req.user.userid, function (err, results) {
      if (err) {
        res.send(500);
      }
      res.json(results);
  });
});

router.get('/:id', function(req, res){
  res.render('bee_room', {bee_id:req.params.id});
});

router.post('/beeinfo', function(req, res){
  var queryData = 'SELECT bee_title, bee_description, bee_thumbnail ';
  queryData += 'FROM bee ';
  queryData += 'WHERE bee_id = ? ';

  db.query(queryData, req.body.beeID, function (err, results) {
      if (err) {
        res.send(500);
      }
      res.json(results);
  });
});

module.exports = router;
