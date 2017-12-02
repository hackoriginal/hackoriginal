angular.module('originalColetivo', ['ngRoute'])
    .service('socket', function () {
        return io.connect(location.protocol + '//' + location.host);
    })
    .config(function ($provide, $routeProvider, $httpProvider) {
        $routeProvider
            .when('/alertas', {
                controller: function ($route) {
                    console.log("Passou aqui no alertas");
                }
            });
    })
    .controller('main', function ($scope, socket, $http) {
        $scope.auth = false;

        console.log(location.protocol);
        $scope.messages = [];
        $scope.access_token = localStorage.getItem('access_token');
        socket.on('access_token', function (access_token) {
            $scope.$apply(function () {
                $scope.access_token = access_token;
            });
        });
        socket.on('message', function (message) {
            $scope.$apply(function () {
                $scope.messages.unshift(...message.reverse());
            });
        });

        socket.on('authSucess', function (message) {
            $scope.$apply(function () {
                $scope.auth = true;                
            });
        });
        $scope.call = function (resource) {
            socket.emit('exec', 'execute_api(\'' + resource + '\')');
        };

        $http({
            method: 'GET',
            url: location + 'testeapi',
            headers: {
                'Content-Type': 'application/json',
                /* 'token': config.getToken() */
            }
        }).then(function (data) {
            console.log(data);
        }, function (erro) {
            console.log(erro);
        });

        $scope.autenticar = function () {
            var auth = window.open('/oauth');           
        };


    });