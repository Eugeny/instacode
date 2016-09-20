angular.module('app').component('uploader', {
    templateUrl: 'components/uploader.html',
    controller: function (bootstrap) {
        var ctrl = this
        ctrl.step = 'code'
        ctrl.theme = 'fruity'
        
        bootstrap.promise.then(() => {
            ctrl.languages = bootstrap.languages
            ctrl.me = bootstrap.me
        })


        ctrl.goToStep = (step) => {
            ctrl.step = step
        }

        ctrl.publish = () => {

        }

        ctrl.publishAndLogin = () => {

        }

        return this
    }
})
