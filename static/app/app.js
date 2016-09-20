angular.module('app', [
    'ngRoute',
    'templates',
    'ui.bootstrap',
    'ui.codemirror',
]).config(($locationProvider, $routeProvider) => {
    $locationProvider.html5Mode({enabled: true, requireBase: false})
    $routeProvider.when('/', {
        template: '<home-view></home-view>'
    })
}).service('bootstrap', ($http) => {
    this.promise = $http.get('/api/bootstrap').then((response) => {
        this.me = response.data.me
        this.languages = response.data.languages
        return response.data
    })
    return this
}).controller('AppController', function ($rootScope, $timeout, $window, bootstrap) {
    var ctrl = this
    bootstrap.promise.then(() => {
        $rootScope.me = bootstrap.me
    })

    ctrl.login = () => {
        $window.location.href = '/login'
    }

    ctrl.logout = () => {
        $window.location.href = '/logout'
    }

    return ctrl
})