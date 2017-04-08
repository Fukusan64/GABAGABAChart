(function()　{
	angular.module('chat', [])
		.value('userData', {
			name: ''
		})
		.service('socket', function() {
			var socket = io.connect();
			this.emit = function(event, data) {
				socket.emit(event, data);
			};
			this.on = function(event, cb) {
				socket.on(event, cb);
			};
			this.getSocketId = function() {
					return socket.id;
			};
		})
		.controller('nameForm', ['$scope', 'socket', 'userData', function($scope, socket, userData) {
			$scope.isSetted = false;
			$scope.submit = function()　{
				if (!!$scope.name)　{
					socket.emit('c2sLoginNotice', {name: $scope.name});
				}
			};
			socket.on('s2cLoginStatusMessage', function(data)　{
				if (data.error)　{
					$scope.error = data.message;
				}　else　{
					userData.name = $scope.name;
					$scope.isSetted = true;
				}
				$scope.$apply();
			});
		}])
		.controller('chat', ['$scope', 'socket', 'userData', function($scope, socket, userData) {
			$scope.messages = [];
			$scope.$watch(function() {
				return userData.name;
			}, function(){
				$scope.name = userData.name;
			});
			$scope.submit = function() {
				if (!!$scope.message)　{
					socket.emit('c2sChatMessage',{message: $scope.message});
					$scope.message = '';	
				}
			};
			socket.on('s2cChatMessage', function(data) {
				$scope.messages.unshift({
					userName: data.name,
					body: data.message,
					isMyMessage: (socket.getSocketId() == data.fromId),
					isUser: true,
				});
				if($scope.messages.length > 50) {
					$scope.messages.pop();
				}
				$scope.$apply();
			});
			socket.on('s2cLoginNotice',function(data){
				$scope.messages.unshift({
					userName: '',
					body: data.message,
					isMyMessage: false,
					isUser: false
				});
				if($scope.messages.length > 50) {
					$scope.messages.pop();
				}
				$scope.$apply();
			});
			socket.on('s2cDisconnectNotice', function(data){
				$scope.messages.unshift({
					userName: '',
					body: data.message,
					isMyMessage: false,
					isUser: false
				});
				if($scope.messages.length > 50) {
					$scope.messages.pop();
				}
				$scope.$apply();
			});
		}]);
})();
