angular.module('app').component('wallpaperView', {
    bindings: {
        photo: '<'
    },
    templateUrl: 'components/wallpaperView.html',
    controller: function ($scope, $http, $timeout, bootstrap) {
        let ctrl = this

        ctrl.resolutions = [
            {width: 1024, height: 768},
            {width: 1280, height: 720},
            {width: 1280, height: 800},
            {width: 1280, height: 960},
            {width: 1280, height: 1024},
            {width: 1440, height: 900},
            {width: 1680, height: 1050},
            {width: 1920, height: 1080},
            {width: 1920, height: 1200},
            {width: 2560, height: 1600},
            {width: 320, height: 480},
            {width: 640, height: 960},
            {width: 640, height: 1136},
            {width: 480, height: 800},
            {width: 720, height: 1280},
            {width: 900, height: 400},
            {width: 400, height: 900},
        ]

        ctrl.resolution = ctrl.resolutions[7]
        $timeout(() => {
            ctrl.editor.parameters = ctrl.photo.params.parameters
            ctrl.editor.renderer.objectShaders = ctrl.photo.params.shaders
        })

        $http.post('/api/highlight', {
            code: ctrl.photo.code,
            language: ctrl.photo.language,
            theme: ctrl.photo.params.theme,
        }).then((response) => {
            let img = new Image()
            img.src = 'data:image/png;base64,' + response.data
            img.onload = () => {
                ctrl.image = img
                console.log('Image loaded')

                ctrl.editor.renderer.setTexture(ctrl.image)
                $timeout(() => {
                    $scope.$watch('$ctrl.resolution', () => {
                        ctrl.resize(ctrl.resolution.width, ctrl.resolution.height)
                    })
                })
            }
        })

        ctrl.resize = (w, h) => {
            ctrl.editor.renderer.resize(w, h)
        }

        ctrl.generate = () => {
            ctrl.editor.renderer.nextFrameCallback = () => {
                window.location.href = ctrl.editor.renderer.display.toDataURL()
            }
        }

        return ctrl
    }
})
