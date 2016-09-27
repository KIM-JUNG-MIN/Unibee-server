var drawApp = angular.module('drawApp', ['drawControllers']);

drawApp.service('drawService', function() {

    var objectValue = {
        count: 0,
        width: 160,
        height: 400,
        message: '-',
    };

    return {
        getObject: function() {
            return objectValue;
        },
        setCount: function(value) {
            objectValue.count = value;
        },
        setWidth: function(value) {
            objectValue.width = value;
        },
        setMessage: function(value) {
            objectValue.message = value;
        },
        disabled: function() {
            if ( objectValue.count > 0 ){
              return false;
            } else {
              return true;
            }
        }
    }

});
