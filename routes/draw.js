var paper = require('paper');
var projects = require('../util/projects.js');
var db = require('../util/ueberDB.js');

projects = projects.projects;

// Create an in memory paper canvas
var drawing = paper.setup(new paper.Canvas(1920, 1080));

exports.pathStoreFinal = function (object, user, room) {

  var project = projects[room].project;
  project.activate();
  var path = projects[room].external_paths[user];

  // startPath
  if (!path) {
    projects[room].external_paths[user] = new drawing.Path();
    path = projects[room].external_paths[user];

    //Starts the path
    var start_point = new drawing.Point(
        object[1].segments[0][0][0],
        object[1].segments[0][0][1]);
    path.strokeColor = object[1].strokeColor;
    path.strokeWidth = object[1].strokeWidth;

    path.name = object[1].name;
    path.add(start_point);

  }

  var length = object[1].segments.length;

  for (var i = 1; i < length; i++) {
    path.add(new drawing.Point(
      object[1].segments[i][0][0],
      object[1].segments[i][0][1]));
  }

  path.smooth();
  project.view.draw();
  projects[room].external_paths[user] = false;

  db.storeProject(room);

};


// Remove an item from the canvas
exports.removeHitItem = function(room, itemName) {
  var project = projects[room].project;
  if (project && project.activeLayer && project.activeLayer.children[itemName]) {
    project.activeLayer.children[itemName].remove();
    db.storeProject(room);
  }
}

// Add image to canvas
exports.addImage = function(room, img, position, name) {
  var project = projects[room].project;
  if (project && project.activeLayer) {
    var raster = new drawing.Raster(img);
    raster.position = new drawing.Point(position[1], position[2]);
    raster.name = name;
    db.storeProject(room);
  }
}

// Move one or more existing items on the canvas
exports.moveItemsProgress = function(room, itemName, delta) {
  if (project.activeLayer.children[itemName]) {
    project.activeLayer.children[itemName].position += new Point(delta[1], delta[2]);
  }
  var project = projects[room].project;
  if (project && project.activeLayer) {


      var itemName = itemNames[x];
      var namedChildren = project.activeLayer._namedChildren;
      if (namedChildren && namedChildren[itemName] && namedChildren[itemName][0]) {
        project.activeLayer._namedChildren[itemName][0].position.x += delta[1];
        project.activeLayer._namedChildren[itemName][0].position.y += delta[2];
      }

  }
}

// Move one or more existing items on the canvas
// and write to DB
exports.moveItemsEnd = function(room, itemName, position) {
  var project = projects[room].project;

  if (project && project.activeLayer && project.activeLayer.children[itemName]) {
    project.activeLayer.children[itemName].position.x = position[1];
    project.activeLayer.children[itemName].position.y = position[2];
  }
  db.storeProject(room);
}
