var drawControllers = angular.module('drawControllers', []);

var strokeSlider = $('#ex8').slider({tooltip: 'always'})
		.on('change', changeThick)
		.data('slider');

var thick = 5;

function changeThick() {
	thick = strokeSlider.getValue();
};


drawControllers.controller('drawCtrl', function($scope, drawService){
  // $scope.submit= function(){
  //     console.log($scope.hello);
  // }

});

drawControllers.directive('drawingBoard', function(){

  return {
		link: function draw($scope, element, attrs){

    		var canvas = document.getElementById('myCanvas');
      		paper = new paper.PaperScope();
          paper.install(window);
      		paper.setup(canvas);

      		with (paper) {

      			var shape = new Shape.Circle(new Point(200, 200), 200);
              shape.strokeColor = 'black';
              shape.fillColor = 'yellow';

            // Display data in canvas
      			var text = new PointText(new Point(20, 20));
      				text.justification = 'left';
      				text.fillColor = 'black';

      			var text2 = new PointText(new Point(200, 200));
      				text2.justification = 'center';
      				text2.fillColor = 'black';
      				text2.content = 'click to change size';


              var path;
              var drag = false;

              function mouseDown(event) {

                  console.log(event);
                  //Set  flag to detect mouse drag
                  drag = true;
                  path = new paper.Path();
                  path.strokeColor = 'black';
                  path.strokeWidth = thick;
                  path.add(new paper.Point(event.offsetX, event.offsetY));
              }

              function mouseDrag(event) {
                  if (drag) {
                      path.add(new paper.Point(event.offsetX, event.offsetY));
                      path.smooth();
                  }
              }

              function mouseUp(event) {
                  //Clear Mouse Drag Flag
                  drag = false;
              }

            $scope.submit= function(){
              console.log(thick);
              good = $scope.hello;
              alert(good);
            }

      			paper.view.draw();

      		}

        element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);

    	}
      //function draw

	}
  // link:
});
