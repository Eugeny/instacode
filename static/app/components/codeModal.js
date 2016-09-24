angular.module('app').component('codeModal', {
    bindings: {
        resolve: '<',
        modalInstance: '<',
    },
    templateUrl: 'components/codeModal.html',
    controller: function () {
        var ctrl = this
        ctrl.photo = ctrl.resolve.photo
        return ctrl
    }
})
