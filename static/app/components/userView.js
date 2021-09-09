angular.module('app').component('userView', {
    bindings: {
        user: '<'
    },
    templateUrl: 'components/userView.html',
    controller: function () {
        let ctrl = this

        return ctrl
    }
})
