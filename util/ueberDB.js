var ueberDB = require("ueberDB");
var projects = require('./projects.js');

var db = new ueberDB.database( "mysql", {
  host:'fgdbinstance.cmclvpcsh0vw.ap-northeast-1.rds.amazonaws.com',
  port:'3306',
  user:'ikbee',
  password:'dkffkqb77',
  database : 'Unibee'
});

// Init..
db.init(function(err){
  if(err){
    console.error(err);
  }
});

// Write to teh database
exports.storeProject = function(room) {
  var project = projects.projects[room].project;
  var json = project.exportJSON();
  console.log("Writing project to database");
  db.set(room, {project: json});
}

// Try to load room from database
exports.load = function(room, socket) {
  console.log("load from db");
  if (projects.projects[room] && projects.projects[room].project) {
    var project = projects.projects[room].project;
    db.get(room, function(err, value) {

      if (value && project && project.activeLayer) {

        socket.emit('loading:start');
        // Clear default layer as importing JSON adds a new layer.
        // We want the project to always only have one layer.
        project.activeLayer.remove();
        project.importJSON(value.project);
        socket.emit('project:load', value);
      }
      socket.emit('loading:end');
    });
    socket.emit('loading:end'); // used for sending back a blank database in case we try to load from DB but no project exists
  } else {
    loadError(socket);
  }
}

exports.db = db;
