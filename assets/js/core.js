//assets/core.js
var telescopejs = angular.module('telescopejs', []);

function mainController($scope, $http) {
	//When landing on page, get all connected telescopes and show them
	$http.get('/api/telescopes')
		.success(function(data) {
			$scope.telescopes = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	$http.get('/api/clients')
		.success(function(data) {
			$scope.clients = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
}