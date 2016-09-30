var drawControllers = angular.module('drawControllers', []);

var strokeSlider = $('#ex8').slider({tooltip: 'always'})
		.on('change', changeThick)
		.data('slider');

var bee_room = window.location.pathname.split('/')[2];
paths = {};
var thick = 5;
var color = 'green';
var socket = io();
var currentUser;
var currentPathName;

function changeThick() {
	thick = strokeSlider.getValue();
};


drawControllers.controller('drawCtrl', function($scope, $http, drawService){

	$http.get('/userinfo/me').success(function(response){
		 currentUser = response[0].userid;
	});
});

drawControllers.directive('drawingBoard', function(){

  return {
		link: function draw($scope, element, attrs){

    		var canvas = document.getElementById('myCanvas');
      		paper = new paper.PaperScope();
          paper.install(window);
      		paper.setup(canvas);

      		with (paper) {

              function mouseDown(event) {

								var startObject = {
								  x: event.offsetX,
								  y: event.offsetY,
									color: color,
									thick: thick
								}

								startPath(startObject, currentUser);
								socket.emit('startPath', startObject, currentUser, bee_room);
              }

              function mouseDrag(event) {

								var continueObject = {
							    x: event.offsetX,
							    y: event.offsetY
							  }

								continuePath(continueObject, currentUser);
								socket.emit('continuePath', continueObject, currentUser, bee_room);

              }

              function mouseUp(event) {

								var endObject = {
							    x: event.offsetX,
							    y: event.offsetY
							  }

								var path = paths[currentUser];

								path.add(new paper.Point(endObject.x, endObject.y));
								path.smooth();

								delete paths[currentUser]

								socket.emit('endPath', endObject, path, currentUser, bee_room);

              }

      			paper.view.draw();

      		}

        element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);

    	}
      //function draw

	}
  // link:
});

function startPath(data, currentUser) {

  paths[currentUser] = new paper.Path({
	  	strokeColor: data.color,
			strokeWidth: data.thick
	  }
	);

	currentPathName = currentUser + ':path:' + paths[currentUser].id;
	paths[currentUser].name = currentPathName;
	paths[currentUser].add(new paper.Point(data.x, data.y));

	console.log('start');
	console.log(data.x);
	console.log(data.y);

}


function continuePath(data, currentUser) {

	var path = paths[currentUser];

	if (path) {
		path.add(new paper.Point(data.x, data.y));
		path.smooth();
	}

}


function endPath(data, currentUser) {

	var path = paths[currentUser];

	path.add(new paper.Point(data.x, data.y));
	path.smooth();

	delete paths[currentUser]

}


socket.emit('joinBee', {room:bee_room});

socket.on('loading:start', function() {
  console.log('loading:start');
});

socket.on('project:load', function(json) {
  console.log("project:load");
  paper.project.activeLayer.remove();
  paper.project.importJSON(json.project);

  paper.view.draw();

});

socket.on('project:load:error', function() {
  console.log('project:load:error');
});


socket.on('loading:end', function() {
  console.log('loading:end');
});


socket.on('startPath', function(data, user){
	 startPath(data, user);
});

socket.on('continuePath', function(data, user) {
		continuePath(data, user);
		paper.view.draw();
});

socket.on('endPath', function(data, user) {
		endPath(data, user);
		paper.view.draw();
});
