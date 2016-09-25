var friendCtr = angular.module('friendCtr', []);

friendCtr.controller('friendSearch', ['$scope','$http', function($scope, $http) {
  $scope.addFriend = true;
  $scope.submit= function(){

    if ($scope.friendSearch == null) {
      alert('Please input freind id');
    }else{
      $http({
        method: 'POST',
        url: '/friend/search',
        data: 'friendSearch=' + $scope.friendSearch, /* 파라메터로 보낼 데이터 */
  	    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function successCallback(response) {

          var result = response.data[0];

          if (result == null) {
            alert('There is no user');
            $scope.friendSearch = '';
          }else{
            $scope.addFriend = false;
            $scope.showme = true;
            $scope.userprofileimage = response.data[0].userprofileimage;
            $scope.nickname = response.data[0].nickname;
            $scope.userid = response.data[0].userid;
          }

      }, function errorCallback(response) {
          alert('error occur! Try again! ');
      });
    }


  }

}]);
