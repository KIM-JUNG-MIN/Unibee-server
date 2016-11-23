module.exports = function(app) {
  var express = require('express');
  var router = express.Router();

  var fs = require('fs');
  var async = require('async');
  var formidable = require('formidable');
  var AWS = require('aws-sdk');

  var db = require('../util/db.js');
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var sessionStore = new MySQLStore(db.DBoptions, db);

  var pbkfd2Password = require("pbkdf2-password");
  var hasher = pbkfd2Password();
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;

  AWS.config.region = 'ap-northeast-1';

  app.use(session({
    secret: 'sid',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
  }))

  app.use(passport.initialize());
  app.use(passport.session());

  router.get('/register', function(req, res) {
    res.render('register_form');
  });
  //회원가입 form

  router.get('/login', function(req, res) {
    res.render('login_form');
  });
  //로그인 form

  router.post('/register', function(req, res){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      var s3 = new AWS.S3();

      async.waterfall([
          function(callback){
              if (files.userprofile.name != '') {
                   var params = {
                     'Bucket':'unibee/userprofile',
                     'Key': fields.userid + '_profile',
                     'ACL':'public-read',
                     'Body': fs.createReadStream(files.userprofile.path),
                     'ContentType':files.userprofile.type
                   }

                   s3.upload(params, function(err, data) {
                       if (err) throw err;
                       var image_yes = 'https://s3-ap-northeast-1.amazonaws.com/unibee/userprofile/' + fields.userid + '_profile';
                       callback(null, image_yes);
                   });

              }else{
                  var image_no = 'https://s3-ap-northeast-1.amazonaws.com/unibee/userprofile/user_default.png';
                  callback(null, image_no);
              }
          }
      ],
      function(err, imageURL){
        if (err) throw err;

        hasher({password:fields.password}, function(err, pass, salt, hash) {

          var user = {
            authtype: 'local',
            userid : fields.userid,
            password : hash,
            salt : salt,
            nickname : fields.nickname,
            userprofileimage: imageURL
          };

          var sql = 'INSERT INTO user SET ?';
          db.query(sql, user , function(err, result){
            if (err) {
              console.log(err);
              res.status(500);
            } else {
              req.login(user, function(err){
                req.session.save(function(){
                  res.redirect('/');
                });
              });
            }
          }); // db
        }); // hasher
      }); // async
    }); // form.parse

  });
  //회원가입 form에서 받은 데이터로 사용자 추가


  router.post('/login',
    passport.authenticate('local',
    {
      failureRedirect: '/auth/login',
      failureFlash: true }),
      function(req, res){
        req.session.save(function(){
          res.redirect('/');
        });
      }//미들웨어
  );

  passport.use(new LocalStrategy(
    function(userid, password, done){
      var uid = userid;
      var pwd = password;

      var sql = 'SELECT * FROM user WHERE userid =?';
      db.query(sql, uid , function(err, results){
        if (err) {
          return done(null, false, { message: 'Error' });
        }
        var user = results[0];

        if (user) {
          hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
            console.log('hello');
            if(hash === user.password){
              return done(null, user);
            } else {
              return done(null, false, { message: 'Incorrect password.' });
            }
          });
        }else{
          return done(null, false, { message: 'There is no user.' });
        }

      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.userid);
  });
  //session 정보 처음 저장

  passport.deserializeUser(function(id, done) {
    var sql = 'SELECT * FROM user WHERE userid =?';
    db.query(sql, [id] , function(err, results){
      if (err) {
        done('There is no user.');
      }else {
        done(null, results[0]);
      }
    });
  });
  //등록된 session 호출

  router.get('/logout', function(req, res) {
    req.logout();

    req.session.save(function(){
      res.redirect('/');
    });
  });
  //로그아웃

  return router;
}
