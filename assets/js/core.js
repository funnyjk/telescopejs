//assets/core.js
var telescopejs = angular.module('telescopejs', []);

function mainController($scope, $http) {
	$scope.formData = {};
	
	//When landing on page, get all connected telescopes and show them
	$http.get('/api/telescope')
		.success(function(data) {
			$scope.telescopes = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
}