var ToolType = {
	menu_pointer: 1,
	menu_pencil: 2,
	menu_erase: 3
};

var ToolNum;

$('[open-modal]').on('click', function(){
  var id = $(this).attr('open-modal');
  $('.modal#'+id).addClass('active');
});

$('[close-modal]').on('click', function(){
  $(this).parents('.modal').removeClass('active');
});

$('.modal').on('click', function(e) {
  if(e.target !== this){return};
  $(this).removeClass('active');
});

$('#test').BootSideMenu({side:"right", autoClose:true});

var strokeSlider = $('#ex8').slider({tooltip: 'always'})
		.on('change', changeThick)
		.data('slider');

$('#fileInput').bind('change', function(e) {
	var file = fileInput.files[0];
	var imageType = /image.*/;

	if (file.type.match(imageType)) {
		var reader = new FileReader();

		reader.onload = function(e) {

			var img = new Image();
			img.src = reader.result;
			drawImage(img.src);
		};

		reader.readAsDataURL(file);
	} else {
		alert('Can not load image!');
	}
});

var bee_room = window.location.pathname.split('/')[2];
paths = {};
var thick = 2;
var color = '#000';
var socket = io();
var currentUser;
var currentPathName;

function changeThick() {
	thick = strokeSlider.getValue();
}

function changeColor(jscolor) {
	color = '#' + jscolor;
}

var drawControllers = angular.module('drawControllers', []);

drawControllers.controller('drawCtrl', function($scope, $http, $window, drawService){

	// get currentUser and online
	$scope.userInfo = function(){
		$http.get('/userinfo/me').success(function(response){
			 currentUser = response[0].userid;

			 var data_login= {
				 userID:currentUser,
				 beeID:bee_room
			 }
			 socket.emit('joinBee', data_login);
			 socket.emit('user:connection', data_login);
		});
	}

	// get current bee information
	$scope.beeInfo = function(){
		$http({
			method: 'POST',
			url: '/bee/beeinfo',
			data: 'beeID=' + bee_room, /* 파라메터로 보낼 데이터 */
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(function successCallback(response) {
				$scope.beeinfo = response.data[0];

		}, function errorCallback(response) {
				alert('error occur! Try again! ');
		});
	}

	// get memberList
	$scope.memberList= function(){
		$http({
			method: 'POST',
			url: '/member/list',
			data: 'beeID=' + bee_room, /* 파라메터로 보낼 데이터 */
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(function successCallback(response) {
				$scope.memberlist = response.data;
		}, function errorCallback(response) {
				alert('error occur! Try again! ');
		});
	}

	// when click member search button
  $scope.searchMember= function(){

    if ($scope.memberSearch == null) {
      alert('Please input freind id');
    }else{
      $http({
        method: 'POST',
        url: '/member/search',
        data: 'memberSearch=' + $scope.memberSearch, /* 파라메터로 보낼 데이터 */
  	    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function successCallback(response) {

          var result = response.data[0];

          if (result == null) {
            alert('There is no user');
            $scope.memberSearch = '';
          }else{
            $scope.showme = true;
            $scope.userprofileimage = response.data[0].userprofileimage;
            $scope.nickname = response.data[0].nickname;
            $scope.userid = response.data[0].userid;
          }

      }, function errorCallback(response) {
          alert('error occur! Try again! ');
      });
    }
  };

	// when click member invite
	$scope.addMemberOK= function(userid){
		if (userid == null) {
			alert('There is no member to invite');
		}else{
			$http({
        method: 'POST',
        url: '/member/add',
        data: 'memberID=' + userid + '&beeID=' + bee_room, /* 파라메터로 보낼 데이터 */
  	    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function successCallback(response) {

					if (response.data) {
						$('#myModal2').modal('hide');
						$scope.memberSearch = '';
						$scope.showme = false;
						$scope.memberList();
					} else {
						alert('already member of bee');
					}

      }, function errorCallback(response) {
          alert('error occur! Try again! ');
      });
		}
  };

	// update member online statu
	socket.on('changeOnline',function(){
		console.log('update user online status');
		$scope.memberList();
	});

	// initialize
	(function(){
		$scope.showme = false;
		$scope.userInfo();
		$scope.beeInfo();
		$scope.memberList();
	})();

	$scope.onClickPointer = function(){
		$(".iconmenu li a").removeClass("active");
		$('#menu_pointer').addClass("active");
		document.getElementById("pencilSidenav").style.display='none';
		ToolNum = 1;
	};

	$scope.onClickPencil = function(){
		$(".iconmenu li a").removeClass("active");
		$('#menu_pencil').addClass("active");
		ToolNum = 2;

		var element = document.getElementById('pencilSidenav'),
	      style = window.getComputedStyle(element),
	      display = style.getPropertyValue('display');

		if (display == 'none') {
			element.style.display='block';
		}else{
		  element.style.display='none';
	  }

	};

	$scope.onClickErase = function(){
		$(".iconmenu li a").removeClass("active");
		$('#menu_erase').addClass("active");
		document.getElementById("pencilSidenav").style.display='none';
		ToolNum = 3;
	};

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
								};

								switch (ToolNum) {
									case ToolType.menu_pointer :
									case ToolType.menu_erase :

										var hitOptions = {
												segments: false,
												stroke: true,
												fill: false,
												tolerance: 5
										};

										var	hitResult = project.hitTest(new paper.Point(event.offsetX, event.offsetY), hitOptions);

										if (hitResult &&  ToolNum == ToolType.menu_pointer && hitResult.type == 'pixel') {
											var hitImageItem = hitResult.item;
											hitImageItem.selected = true;
										} else if ( hitResult &&  ToolNum == ToolType.menu_erase) {
											var hitPathItem = hitResult.item;
											removeItem(hitPathItem.name);
											socket.emit('Hit:remove', bee_room, hitPathItem.name);
										}
										break;
									case ToolType.menu_pencil :
										startPath(startObject, currentUser);
										socket.emit('startPath', startObject, currentUser, bee_room);
										break;
									default:

								}

              }//mouseDown

              function mouseDrag(event) {

								var continueObject = {
							    x: event.offsetX,
							    y: event.offsetY
							  };

								switch (ToolNum) {
									case ToolType.menu_pointer :
									case ToolType.menu_erase :

										break;
									case ToolType.menu_pencil :
										continuePath(continueObject, currentUser);
										socket.emit('continuePath', continueObject, currentUser, bee_room);
										break;
									default:

								}

              }//mouseDrag

              function mouseUp(event) {

								var endObject = {
							    x: event.offsetX,
							    y: event.offsetY
							  };

								switch (ToolNum) {
									case ToolType.menu_pointer :
									case ToolType.menu_erase :

										break;
									case ToolType.menu_pencil :
										var path = paths[currentUser];

										path.add(new paper.Point(endObject.x, endObject.y));
										path.smooth();

										delete paths[currentUser];

										socket.emit('endPath', endObject, path, currentUser, bee_room);
										break;
									default:

								}

              }//mouseUp

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

function drawImage(img){
	var raster = new Raster(img);
	raster.position = paper.view.center;
	raster.name = currentUser + ":image:" + raster.id;
	socket.emit('image:add', bee_room, img, raster.position, raster.name);
}

//socket.emit('joinBee', {room:bee_room});

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
