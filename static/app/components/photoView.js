angular.module('app').component('photoView', {
    bindings: {
        photo: '<'
    },
    templateUrl: 'components/photoView.html',
    controller: function () {
        let ctrl = this
        console.log(ctrl)
        return ctrl
    }
})
