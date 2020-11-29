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
    $scope.leds_status = [0, 0];
	
	$scope.changeLED = function() {
		console.log("send LED ", $scope.leds_status)
		
		var json = {
			"led": $scope.leds_status
		}
		mySocket.emit("LED", json)
	}
	
	mySocket.on('TC', function(msg) {
		$scope.temp = msg.TC.split(':')[1];
	})

	mySocket.on('HUM', function(msg) {
		$scope.humidity = msg.HUM.split(':')[1];
	})
	
	mySocket.on('connect', function() {
		console.log("connected")
	})
});