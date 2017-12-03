angular.module('originalColetivo', ['ngRoute'])
    .service('socket', function () {
        return io.connect(location.protocol + '//' + location.host);
    })
    .config(function ($provide, $routeProvider, $httpProvider) {
        function verificarLogin() {
            //faz uma verificação via socket
        }

        $routeProvider
            .when('/login', {
                templateUrl: "login.html"
            })
            .when('/aprovado', {
                templateUrl: "aprovado.html",
                resolve: verificarLogin()
            })
            .when('/bem-vindo', {
                templateUrl: "bem-vindo.html"
            })
            .when('/cartoes', {
                templateUrl: "cartoes.html"
            })
            .when('/comecar', {
                templateUrl: "comecar.html"
            })
            .when('/forma-pagamento', {
                templateUrl: "forma-pagamento.html"
            })
            .when('/loading', {
                templateUrl: "loading.html"
            })
            .when('/login', {
                templateUrl: "login.html"
            })
            .when('/novidades', {
                templateUrl: "novidades.html"
            })
            .when('/principal', {
                templateUrl: "principal.html"
            })
            .when('/valor-colaboracao', {
                templateUrl: "valor-colaboracao.html"
            })
            .when('/eventos', {
                templateUrl: "eventos.html"
            })
            .when('/detalhes-evento', {
                templateUrl: "detalhes-evento.html"
            })
            .when("/", {
                templateUrl: "login.html"
            }).otherwise("/");
    })
    .controller('main', function ($scope, socket, $http, $location) {
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

        $scope.autenticar = function () {
            var auth = window.open('/oauth');
        };

        $scope.verificarPontos = function () {
            socket.emit('dados', 'saldoPontos');
        };

        $scope.listaCartoes = function () {
            socket.emit('dados', 'listaCartoes');
        };

        $scope.saldo = function () {
            socket.emit('dados', 'saldo');
        };

        socket.on('listaCartoesSucess', function (message) {
            console.log(message);
            /* $scope.$apply(function () {
                $scope.saldoEmPontos = message;                
            }); */
        });

        $scope.irBoasVindas = function () {
            $location.path('bem-vindo');
        };

        $scope.explorarProjetos = function () {
            $location.path('eventos');
        };

        $scope.verDetalhesEvento = function () {
            $location.path('detalhes-evento');
        };

        $scope.colaborarComEvento = function(){
            $location.path('forma-pagamento');
        };

        socket.on('saldoPontosSucess', function (message) {
            console.log(message);
            $scope.$apply(function () {
                $scope.saldoEmPontos = message;
            });
        });
    });