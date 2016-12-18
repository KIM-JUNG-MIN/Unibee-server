var mainCtr = angular.module('mainCtr', [])
  .controller('BeeList', ['$scope','$http', '$window', function($scope, $http, $window) {

    $scope.enterBee = function(bee_id){
      var url = '/bee/' + bee_id;
      $window.location.href= url;
    };

    $http.get('/bee/list').success(function(response){
      $scope.beelist = response;
    });
}])
  .controller('UserInfo', ['$scope','$http', '$window', function($scope, $http, $window) {

    $http.get('/userinfo/me').success(function(response){
       $scope.userinfo = response[0];
    });

}]);
