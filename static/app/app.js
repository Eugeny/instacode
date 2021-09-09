angular.module('app', [
    'ngRoute',
    'templates',
    'ui.bootstrap',
    'ui.codemirror',
    'ui.select',
])

.config(($locationProvider, $routeProvider) => {
    $locationProvider.html5Mode({enabled: true, requireBase: false})
    $routeProvider.when('/', {
        template: '<home-view></home-view>'
    })
    $routeProvider.when('/user/:username', {
        template: '<user-view user="$resolve.userResponse.data"></user-view>',
        resolve: {
            userResponse: ($route, $http) => $http.get(`/api/user/${$route.current.params.username}`)
        },
    })
    $routeProvider.when('/wallpaper/:id', {
        template: '<wallpaper-view photo="$resolve.photoResponse.data"></wallpaper-view>',
        resolve: {
            photoResponse: ($route, $http) => $http.get(`/api/photo/${$route.current.params.id}`)
        },
    })
    $routeProvider.when('/:id', {
        template: '<photo-view photo="$resolve.photoResponse.data"></photo-view>',
        resolve: {
            photoResponse: ($route, $http) => $http.get(`/api/photo/${$route.current.params.id}`)
        },
    })
})

.service('bootstrap', ($http) => {
    this.promise = $http.get('/api/bootstrap').then((response) => {
        this.me = response.data.me
        this.languages = response.data.languages
        return response.data
    })
    return this
})

.controller('AppController', function ($rootScope, $timeout, $window, bootstrap) {
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

.filter('urlencode', function() {
    return (input) => input ? window.encodeURIComponent(input) : ''
})
