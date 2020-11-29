angular.module('myApp', [
    'ngRoute',
    'mobile-angular-ui',
	'btford.socket-io'
]).config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'home.html',
        controller: 'Home'
    });
}).factory('mySocket', function (socketFactory) {
	var myIoSocket = io.connect('/webapp');

	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	return mySocket;

}).controller('Home', function($scope, mySocket) {
    $scope.temp = "";
	$scope.humidity = "";
	$scope.cameraStreamUrl = "";
    $scope.leds_status = [0, 0];
	
	$scope.changeLED = function() {
		//console.log("send LED ", $scope.leds_status)
		
		var json = {
			"led": $scope.leds_status
		}
		mySocket.emit("LED", json)
	}

	mySocket.on('CAMERA', function(msg){
		//console.log(msg);
		$scope.cameraStreamUrl = msg;
	})
	
	mySocket.on('TC', function(msg) {
		//console.log(msg);
		$scope.temp = msg;
	})

	mySocket.on('HUM', function(msg) {
		//console.log(msg);
		$scope.humidity = msg;
	})
	
	mySocket.on('connect', function() {
		console.log("connected")
	})
});