var drawControllers = angular.module('drawControllers', []);

var hitOptions = {
		segments: false,
		stroke: true,
		fill: true,
		tolerance: 5
};

var strokeSlider = $('#ex8').slider({tooltip: 'always'})
		.on('change', changeThick)
		.data('slider');

var isErase =  $('#toggle-erase').prop('checked');

$( "#btn_png" ).click(function() {
	// Fetch all selected path items:
	var items = project.getItems({
	    selected: false
	});
	console.log(items);
});

$('#toggle-erase').change(function() {
		isErase = $(this).prop('checked');
});

$('#fileInput').bind('change', function(e) {
	var file = fileInput.files[0];
	var imageType = /image.*/;

	if (file.type.match(imageType)) {
		var reader = new FileReader();

		reader.onload = function(e) {

			var img = new Image();
			img.src = reader.result;

			drawImage(img.src);
		}

		reader.readAsDataURL(file);
	} else {
		alert('Can not load image!');
	}
});

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


function drawImage(img){
	var raster = new Raster(img);
	raster.position = paper.view.left;
	raster.name = currentUser + ":image:" + raster.id;;
	socket.emit('image:add', bee_room, img, raster.position, raster.name);
}

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

								if (isErase) {
									//erase mode (isErase = true)

									var mouseTouch = new paper.Point(event.offsetX, event.offsetY)

									hitResult = project.hitTest(mouseTouch, hitOptions);

									if (hitResult) {
										//There is hitResult
										if (hitResult.type == 'stroke') {
											var hitItem = hitResult.item;
											removeItem(hitItem.name);
											//hitItem.remove();
											socket.emit('Hit:remove', bee_room, hitItem.name);
										}else if (hitResult.type == 'pixel') {
											var hitItem = hitResult.item;
											removeItem(hitItem.name);
											socket.emit('Hit:remove', bee_room, hitItem.name);
											//selectObject = hitResult.item;
											//SelectedLine(true);
										}
									}



								}else{
									//draw mode (isErase = false)
									startPath(startObject, currentUser);
									socket.emit('startPath', startObject, currentUser, bee_room);
								}
              }

              function mouseDrag(event) {

								var continueObject = {
							    x: event.offsetX,
							    y: event.offsetY
							  }

								if (isErase) {

								}else{
									continuePath(continueObject, currentUser);
									socket.emit('continuePath', continueObject, currentUser, bee_room);
								}


              }

              function mouseUp(event) {

								var endObject = {
							    x: event.offsetX,
							    y: event.offsetY
							  }

								if (isErase) {

								}else{
									var path = paths[currentUser];

									path.add(new paper.Point(endObject.x, endObject.y));
									path.smooth();

									delete paths[currentUser]

									socket.emit('endPath', endObject, path, currentUser, bee_room);
								}


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

function removeItem(name) {
	var target = project.activeLayer.children[name];
	target.remove();
	paper.view.draw();
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

socket.on('Hit:remove', function(name) {
	  removeItem(name);
});

socket.on('image:add', function(img, position, name) {
	var raster = new Raster(img);
	raster.position = new Point(position[1], position[2]);
	raster.name = name;
	paper.view.draw();

});
