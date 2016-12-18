// npm package
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(http);

// router
var auth = require('./routes/auth');
var bee = require('./routes/bee');
var userinfo = require('./routes/userinfo');
var member = require('./routes/member');

// modules
var projects = require('./util/projects.js');
var db = require('./util/db.js');
var ueberDB = require('./util/ueberDB.js');
var paper = require('paper');
var draw = require('./routes/draw.js');

// set Port
app.set('port', process.env.PORT || 9000);

// post method parser
app.use(bodyParser.urlencoded({ extended: false }));

// static path
app.use('/public', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// routing
app.use('/auth', auth(app));
app.use('/bee', bee);
app.use('/userinfo', userinfo);
app.use('/member', member);

// view template
app.set('views', './views');
app.set('view engine', 'jade');

// home
app.get('/', function(req, res){
  if(req.user) {
    res.render('dashboard', {nickname:req.user.nickname});
  } else {
    res.render('home');
  }
});

io.sockets.on('connection', function(socket){

  socket.on('user:connection',function(data){

      var query='UPDATE member SET user_online = ? ';
      query += 'WHERE user_member = ? ';
      query += 'AND bee_member = ? ';

      db.query(String(query),['Y',data.userID, data.beeID],function(err,rows){
        console.log(data.userID + ' connect...');
        io.emit('changeOnline');
      });
  });

  // User joins a room
  socket.on('joinBee', function(data) {
    console.log('on joinBee...' + data.beeID);
    joinBee(socket, data);
  });

  socket.on('startPath', function(data, user, room) {
    if (!projects.projects[room] || !projects.projects[room].project) {
      loadError(socket);
      return;
    }
    socket.broadcast.to(room).emit('startPath', data, user);
  });

  socket.on('continuePath', function(data, user, room) {
    if (!projects.projects[room] || !projects.projects[room].project) {
      loadError(socket);
      return;
    }
    socket.broadcast.to(room).emit('continuePath', data, user);
  });

  socket.on('endPath', function(data, path, user, room) {
    if (!projects.projects[room] || !projects.projects[room].project) {
      loadError(socket);
      return;
    }
    draw.pathStoreFinal(path, user, room);
    socket.broadcast.to(room).emit('endPath', data, user);
  });

  socket.on('Hit:remove', function(room, name){
    socket.broadcast.to(room).emit('Hit:remove', name);
    draw.removeHitItem(room, name);
  });

  socket.on('image:add', function(room, img, position, name){
    socket.broadcast.to(room).emit('image:add', img, position, name);
    draw.addImage(room, img, position, name);
  });

  // User moves one or more items on their canvas - progress
  socket.on('item:move:progress', function(room, uid, itemName, delta) {
    //draw.moveItemsProgress(room, uid, itemNames, delta);
    console.log(delta);
    if (itemName) {
      io.sockets.in(room).emit('item:move', itemName, delta);
    }
  });

  // User moves one or more items on their canvas - end
  socket.on('item:move:end', function(room, itemName, position) {
    draw.moveItemsEnd(room, itemName, position);
    // if (itemName) {
    //   io.sockets.in(room).emit('item:move', uid, itemName, delta);
    // }
  });

  socket.on('disconnect',function(){

    var query='UPDATE member SET user_online = ? ';
    query += 'WHERE user_member = ? ';
    query += 'AND bee_member = ? ';

    db.query(String(query),['N',socket.name, socket.bee],function(err,rows){
      console.log(socket.name + ' disconnect...');
      io.emit('changeOnline');
    });

  });

});

// Subscribe a client to a room
function joinBee(socket, data) {
  var room = data.beeID;
  var user = data.userID;
  // Subscribe the client to the room
  socket.join(room);
  socket.name = user;
  socket.bee = room;

  // Create Paperjs instance for this room if it doesn't exist
  var project = projects.projects[room];
  if (!project) {
    console.log("made room");
    projects.projects[room] = {};
    // Use the view from the default project. This project is the default
    // one created when paper is instantiated. Nothing is ever written to
    // this project as each room has its own project. We share the View
    // object but that just helps it "draw" stuff to the invisible server
    // canvas.
    projects.projects[room].project = new paper.Project();
    projects.projects[room].external_paths = {};
    ueberDB.load(room, socket);
  } else {
    // Project exists in memory, no need to load from database
    loadFromMemory(room, socket);
  }
}

// Send current project to new client
function loadFromMemory(room, socket) {
  var project = projects.projects[room].project;
  if (!project) { // Additional backup check, just in case
    ueberDB.load(room, socket);
    return;
  }
  socket.emit('loading:start');
  var value = project.exportJSON();
  socket.emit('project:load', {project: value});
  socket.emit('loading:end');
}

function loadError(socket) {
  socket.emit('project:load:error');
}

// open server
http.listen(app.get('port'), function()
{
	console.log('listening on Unibee server', app.get('port'));
});
