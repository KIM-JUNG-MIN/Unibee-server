var mainCtr = angular.module('mainCtr', []);

mainCtr.controller('BeeList', ['$scope','$http', function($scope, $http) {

  $http.get('/bee/list').success(function(response){
    $scope.beelist = response;
  });
}]);

mainCtr.controller('UserInfo', ['$scope','$http', function($scope, $http) {

  $http.get('/userinfo/show').success(function(response){
     $scope.userinfo = response;
  });
}]);

mainCtr.controller('FriendList', ['$scope','$http', function($scope, $http) {

  $http.get('/friend/list').success(function(response){
     $scope.friendlist = response;
  });
}]);

mainCtr.controller('AllUser', ['$scope','$http', function($scope, $http) {
  $http.get('/userinfo/all').success(function(response){
     $scope.alluser = response;
  });
}]);
