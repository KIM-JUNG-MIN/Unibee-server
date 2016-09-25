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

var room = 'hello';

router.get('/new', function(req, res){
  res.render('bee_new_form');
});

router.post('/new', function(req, res){
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

    var beeid = shortid.generate();

    var bee = {
      bee_id: beeid,
      bee_title: ' ',
      bee_description : ' ',
      bee_thumbnail : ' '
    };

    var member = {
      user_member_list: req.user.userid,
      bee_member_list: beeid
    }

    if (files.beethumbnail.name != '') {

      var s3 = new AWS.S3();
      var params = {
        'Bucket':'unibee/beethumbnail',
        'Key': fields.bee_title + '_thumbnail.png',
        'ACL':'public-read',
        'Body': fs.createReadStream(files.beethumbnail.path),
        'ContentType':files.beethumbnail.type
      }

      s3.upload(params, function(err, data) {
          if (err) throw err;
          console.log('seccess upload image to s3');
      });

      bee.bee_thumbnail =  'https://s3-ap-northeast-1.amazonaws.com/unibee/beethumbnail/' + fields.bee_title + '_thumbnail.png';

    }else{
      //there is no image
      bee.bee_thumbnail =  'https://s3-ap-northeast-1.amazonaws.com/unibee/beethumbnail/bee_default.png';

    }

    bee.bee_title = fields.bee_title;
    bee.bee_description = fields.bee_description;

    async.parallel([
        function(callback) {
            var queryData1 = 'INSERT INTO bee SET ?';
            db.query(queryData1, bee, function (err, result1) {
                if (err) {
                    return callback(err);
                }
                return callback(null, result1);
            });
        },
        function(callback) {
            var queryData2 = 'INSERT INTO member SET ?';
            db.query(queryData2, member, function (err, result2) {
                if (err) {
                    return callback(err);
                }
                return callback(null, result2);
            });
        }
    ], function(error, callbackResults) {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/main');
        }
    });
    //async

  });
  //form.parse
});


router.get('/list', function(req, res){

  var queryData = 'SELECT bee.bee_id, bee.bee_title, bee.bee_description, bee.bee_thumbnail ';
  queryData += 'FROM bee, user, member ';
  queryData += 'WHERE bee.bee_id = member.bee_member_list ';
  queryData += 'AND user.userid = member.user_member_list ';
  queryData += 'AND user.userid = ? ';

  db.query(queryData, req.user.userid, function (err, results) {
      if (err) {
        res.send(500);
      }
      res.json(results);
  });
});


router.get('/:id', function(req, res){
  res.render('bee_room', {hello:req.params.id});
});



module.exports = router;
