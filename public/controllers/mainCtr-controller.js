//var socket = io();
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

    var currentUser;

    $http.get('/userinfo/me').success(function(response){
       $scope.userinfo = response[0];
      //  currentUser = response[0].userid;
      //  var data_login={purpose:'login', userid:currentUser}
      //  socket.emit('update_friendlist', data_login);

    });

    // $scope.logout = function(){
    //   $http.post('/auth/logout').success(function(data, status) {
    //     var data_logout={purpose:'logout', userid:currentUser}
    //     socket.emit('update_friendlist', data_logout);
    //     $window.location.href='/main'
    //   }).error(function(data, status) {
    //       alert("Connection Error");
    //   });
    // }

}])
  .controller('FriendList', ['$scope','$http', function($scope, $http) {

    // first friend list
    $http.get('/friend/list').success(function(response){
       $scope.friendlist = response;
    });

    // change friend online status
    socket.on('changeOnline',function(data){
      $http.get('/friend/list').success(function(response){
         $scope.friendlist = response;
         $scope.$apply();
      });
    });
}]);
