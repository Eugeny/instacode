angular.module('app').component('homeView', {
    templateUrl: 'components/homeView.html',
    controller: function ($http) {
        let ctrl = this
        $http.get('/api/feeds').then((response) => {
            ctrl.feeds = response.data
            ctrl.selectedFeed = 'newest'
        })
        return ctrl
    }
})
