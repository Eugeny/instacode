angular.module('app').component('money', {
    templateUrl: 'components/money.html',
    controller: function (bootstrap) {
        let ctrl = this
        bootstrap.promise.then(() => {
            ctrl.me = bootstrap.me
        })
        return ctrl
    }
})
