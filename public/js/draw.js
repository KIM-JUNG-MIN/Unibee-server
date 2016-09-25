var hitOptions = {
		segments: false,
		stroke: true,
		fill: true,
		tolerance: 5
};

var socket = io();
var sessionId = "";
var bee_room = window.location.pathname.split('/')[2];

paths = {};
var path;
var pathname = '';
var imagename = '';
var color = 'black';

var leftUp_rightUP;
var rightUp_rightDown;
var rightDown_leftDown;
var leftDown_leftUp;

var leftUpCircle;
var rightUpCircle;
var rightDownCircle;
var leftDownCircle;

var selectObject;
var selectObject_tr;
var entire;

var strokeSlider = $('#ex8').slider({tooltip: 'always'})
		.on('change', changeThick)
		.data('slider');

var thick = 5;
var isErase =  $('#toggle-erase').prop('checked');

// $('#btn_color').colorpicker().on('changeColor', function(e) {
// 	 color = e.color.toHex();
// });

$( "#btn_png" ).click(function() {

	//selectObject.width= 100;

});

$('#toggle-erase').change(function() {
		isErase = $(this).prop('checked');
});

// User selects an image from the file browser to upload
$('#fileInput').bind('change', function(e) {
	var file = fileInput.files[0];
	var imageType = /image.*/;

	if (file.type.match(imageType)) {
		var reader = new FileReader();

		reader.onload = function(e) {

			var img = new Image();
			img.src = reader.result;

			drawImage(img.src);
			//socket.emit('loadImage', img.src);
		}

		reader.readAsDataURL(file);
	} else {
		alert('Can not load image!');
	}
});

$( "#btn_img_up" ).click(function() {
	selectObject.scale(1.2);
	makeTopRightCircle();
});

$( "#btn_img_down" ).click(function() {
	selectObject.scale(0.8);
	makeTopRightCircle();
});

$( "#btn_img_delete" ).click(function() {
	selectObject.remove();
});

function changeThick() {
	thick = strokeSlider.getValue();
};

function drawImage(img){
	var raster = new Raster(img);
	raster.position = view.center;
	imagename = sessionId + ":image:" + raster.id;
	raster.name = imagename;
	socket.emit('image:add', bee_room, img, raster.position, raster.name);
}

function exportPNG() {
  var canvas = document.getElementById('myCanvas');
	var img    = canvas.toDataURL("image/png");
	document.write('<img src="'+img+'"/>');
}

function onMouseDown(event) {

	var startObject = {
	  x: event.point.x,
	  y: event.point.y,
		color: color,
		thick: thick
	}

	if (isErase) {

		hitResult = project.hitTest(event.point, hitOptions);

			if (hitResult) {

				if (leftUp_rightUP) {
						SelectedLine(false);
				}

				if (hitResult.type == 'stroke'
					&& hitResult.item.name != 'leftUp_rightUP'
					&& hitResult.item.name != 'rightUp_rightDown'
					&& hitResult.item.name != 'rightDown_leftDown'
					&& hitResult.item.name != 'leftDown_leftUp'
					&& hitResult.item.name != 'leftUpCircle'
					&& hitResult.item.name != 'rightUpCircle'
					&& hitResult.item.name != 'rightDownCircle'
					&& hitResult.item.name != 'leftDownCircle') {

					var hitItem = hitResult.item;
					hitItem.remove();
					view.draw();
					socket.emit('Hit:remove', bee_room, hitItem.name);

				}else if (hitResult.type == 'pixel') {
					selectObject = hitResult.item;
					SelectedLine(true);
				}

		}else{
			SelectedLine(false);
			selectObject = null;
		}


	}else{
			startPath(startObject, sessionId);
			socket.emit('startPath', startObject, sessionId, bee_room);
	}

}

function onMouseDrag(event) {

	var step        = event.delta / 50;
  var top         = event.middlePoint + step;
  var bottom      = event.middlePoint - step;

  var topObject = {
    x: top.x,
    y: top.y
  }

  var bottomObject = {
    x: bottom.x,
    y: bottom.y
  }

	var moveImage = {
		raster: selectObject,
		move: event.delta
	}

	if (isErase) {

		var group = new Group([selectObject, leftUp_rightUP, rightUp_rightDown, rightDown_leftDown, leftDown_leftUp,
													leftUpCircle, rightUpCircle, rightDownCircle, leftDownCircle]);
		group.position += event.delta;


		// selectObject.position += event.delta;
		// leftUp_rightUP.position += event.delta;
		// rightUp_rightDown.position += event.delta;
		// rightDown_leftDown.position += event.delta;
		// leftDown_leftUp.position += event.delta;
		//
		// leftUpCircle.position += event.delta;
		// rightUpCircle.position += event.delta;
		// rightDownCircle.position += event.delta;
		// leftDownCircle.position += event.delta;

		socket.emit('item:move:progress', bee_room, sessionId, selectObject.name, event.delta);

	}else{
		continuePath(top, bottom, sessionId);
		socket.emit('continuePath', topObject, bottomObject, sessionId, bee_room);
	}

}

function onMouseUp(event) {

  var endObject = {
    x: event.point.x,
    y: event.point.y
  }

	if (isErase) {

		socket.emit('item:move:end', bee_room,  selectObject.name, selectObject.position);

	}else{
		endPath(endObject, pathname, sessionId);
	  socket.emit('endPath', endObject, pathname, color, thick, sessionId, bee_room);
	}

}

function onKeyUp(event) {
  if (event.key == "delete") {
		// var items = paper.project.selectedItems;
		removeItem(selectObject.name);
		SelectedLine(false);
		socket.emit('Hit:remove', bee_room, selectObject.name);

  }
}

function startPath(data, sessionId) {

  paths[sessionId] = new Path({
	  	strokeColor: data.color,
			strokeWidth : data.thick
	  }
	);

	pathname = sessionId + ":path:" + paths[sessionId].id;

  paths[sessionId].add(new Point(data.x,data.y));

}

function continuePath(top, bottom, sessionId) {

  var path = paths[sessionId];

  path.add(new Point(top.x,top.y));
  path.insert(0, new Point(bottom.x,bottom.y));

}

function endPath(data, pathname, sessionId) {

	var path = paths[sessionId];
	path.name = pathname;
	path.add(new Point(data.x,data.y));
	path.closed = true;
	path.smooth();

	delete paths[sessionId]

}

function pathEndStore(data, pathname, color, thick, user, room) {
	var path = paths[user];

	var path_to_send = {
		name:  pathname,
		color: color,
		thick: thick
	};

	path.name = pathname;
  path.add(new Point(data.x,data.y));
  path.closed = true;
  path.smooth();

	path_to_send.path = paths[user];

  delete paths[user]

	socket.emit('final', JSON.stringify(path_to_send), user, room);

}

function removeItem(name) {
	var target = project.activeLayer.children[name];
	target.remove();
	view.draw();
}

function SelectedLine(isSelected){
		if (isSelected) {
			leftUp_rightUP = new Path.Line({
				from: selectObject.bounds.topLeft,
				to: selectObject.bounds.topRight,
				name: 'leftUp_rightUP',
				strokeColor: 'black'
			});

			rightUp_rightDown = new Path.Line({
				from: selectObject.bounds.topRight,
				to: selectObject.bounds.bottomRight,
				name: 'rightUp_rightDown',
				strokeColor: 'black'
			});

			rightDown_leftDown = new Path.Line({
				from: selectObject.bounds.bottomRight,
				to: selectObject.bounds.bottomLeft,
				name: 'rightDown_leftDown',
				strokeColor: 'black'
			});

			leftDown_leftUp = new Path.Line({
				from: selectObject.bounds.bottomLeft,
				to: selectObject.bounds.topLeft,
				name: 'leftDown_leftUp',
				strokeColor: 'black'
			});

			//

			leftUpCircle = new Shape.Circle({
					center: selectObject.bounds.topLeft,
					radius: 8,
					name: 'leftUpCircle',
					strokeColor: 'black',
					fillColor: 'black'
			});

			rightUpCircle = new Shape.Circle({
					center: selectObject.bounds.topRight,
					radius: 8,
					name: 'rightUpCircle',
					strokeColor: 'black',
					fillColor: 'black'
			});

			rightDownCircle = new Shape.Circle({
					center: selectObject.bounds.bottomRight,
					radius: 8,
					name: 'rightDownCircle',
					strokeColor: 'black',
					fillColor: 'black'
			});

			leftDownCircle = new Shape.Circle({
					center: selectObject.bounds.bottomLeft,
					radius: 8,
					name: 'leftDownCircle',
					strokeColor: 'black',
					fillColor: 'black'
			});
		}else{
			leftUp_rightUP.remove();
			rightUp_rightDown.remove();
			rightDown_leftDown.remove();
			leftDown_leftUp.remove();

			leftUpCircle.remove();
			rightUpCircle.remove();
			rightDownCircle.remove();
			leftDownCircle.remove();
		}
}


socket.on('connect', function () {
	console.log('connected');
	socket.emit('subscribe', {room:bee_room});
});

socket.on('user', function(msg){
	sessionId = msg;
});

socket.on('project:load', function(json) {
  console.log("project:load");
  paper.project.activeLayer.remove();
  paper.project.importJSON(json.project);

  view.draw();

});

socket.on('project:load:error', function() {
  console.log('project:load:error');
});

socket.on('loading:start', function() {
  console.log('loading:start');
});

socket.on('loading:end', function() {
  console.log('loading:end');
});


socket.on('startPath', function(data, user, room){
		startPath(data, user);
});

socket.on('continuePath', function(top, bottom, user, room) {
		continuePath(top, bottom, user);
		view.draw();
		console.log('receive continue from server');
});

socket.on('endPath', function(data, pathname, color, thick, user, room) {
		pathEndStore(data, pathname, color, thick, user, room);
		view.draw();
		console.log('receive end from server');
});

socket.on('Hit:remove', function(name) {
	  removeItem(name);
});

socket.on('image:add', function(img, position, name) {
	var raster = new Raster(img);
	raster.position = new Point(position[1], position[2]);

		//
		// console.log(item_move_delta);


	raster.name = name;
	view.draw();
	console.log(raster);

});

socket.on('item:move', function(itemName, delta) {
    if (project.activeLayer.children[itemName]) {
      project.activeLayer.children[itemName].position += new Point(delta[1], delta[2]);
    }
    view.draw();
});

// Periodically save drawing
setInterval(function(){

}, 1000);
