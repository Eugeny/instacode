angular.module('app').component('uploader', {
    templateUrl: 'components/uploader.html',
    controller: function (bootstrap, $interval, $timeout, $http, $q, $location, $window) {
        var ctrl = this
        ctrl.code = $location.search().post_code || ''
        ctrl.step = 'code'
        ctrl.theme = 'fruity'
        ctrl.title = ''
        ctrl.language = $location.search().post_lang || 'JavaScript'
        ctrl.spoilOpacity = [0, 0, 0, 0, 0, 0]
        ctrl.spoilRate = [0, 0, 0, 0, 0, 0]
        ctrl.spoilEnabled = false
        ctrl.spoilVisible = false
        ctrl.stylesLimit = 5

        ctrl.styles= [
            'fruity',
            'monokai',
            'solarized',
            'paraiso-dark',
            'xcode',
            'tango',
            'vim',
            'vs',
            //'manni',
            'igor',
            'solarized256',
            'lovelace',
            'autumn',
            'perldoc',
            'borland',
            'emacs',
            'friendly',
            //'colorful',
            'murphy',
            'bw',
            'paraiso-light',
            'trac',
            'algol',
        ]
        ctrl.effects = [
            {
                name: 'Pixels',
                id: 'pixels',
            },
            {
                name: 'LCD pixels',
                id: 'LCDpixels',
            },
            {
                name: 'Sepia',
                id: 'sepia',
            },
            {
                name: 'Desaturate',
                id: 'desaturate',
            },
            {
                name: 'Vignette',
                id: 'vignette',
            },
            {
                name: 'Tilt shift',
                id: 'tiltshift',
            },
            {
                name: 'Noise',
                id: 'noise',
            },
        ]

        bootstrap.promise.then(() => {
            ctrl.languages = bootstrap.languages
            ctrl.me = bootstrap.me
        })


        let loadImage = (url) => {
            let img = new Image()
            img.src = url
            img.onload = () => {
                ctrl.editor.renderer.setTexture(img)
                console.log('Image loaded')
            }
        }

        ctrl.goToStep = (step) => {
            ctrl.step = step

            if (step == 'style') {
                ctrl.spoilVisible = true
                ctrl.spoilEnabled = true
                $http.post('/api/highlight', {
                    code: ctrl.code,
                    language: ctrl.language,
                    theme: ctrl.theme,
                }).then((response) => {
                    ctrl.spoilEnabled = false
                    ctrl.editorActive = true
                    $timeout(() => {
                        ctrl.spoilVisible = false
                        ctrl.editor.renderer.resize(400, 400)
                        loadImage('data:image/png;base64,' + response.data)
                    }, 1500)
                }, () => {
                    // TODO
                })
            }
        }

        ctrl.doPublish = () => {
            return ctrl.editor.getImage().then((image) => {                
                data = {
                    image: image,
                    code: ctrl.code,
                    language: ctrl.language,
                    theme: ctrl.theme,
                    title: ctrl.title,
                    parameters: ctrl.editor.parameters,
                    shaders: ctrl.editor.renderer.objectShaders,
                }
                return $http.post('/api/publish', data).then((response) => {
                    if (response.data.state != 'ok')
                        return $q.reject()
                    return response.data
                })
            })
        }

        ctrl.publish = () => {
            ctrl.doPublish().then((data) => {
                $location.path(`/${data.id}`)
            })
        }

        ctrl.publishAndLogin = () => {
            ctrl.doPublish().then((data) => {
                $window.location.href = `/login?return=/${data.id}`
            })
        }

        spoilInterval = $interval(() => {
            let i = Math.floor(Math.random() * 3)
            ctrl.spoilOpacity[i] = Math.random() / (i + 1)
        }, 50)

        ctrl.$onDestroy = () => {
            $interval.cancel(spoilInterval)
        }

        ctrl.$onInit = () => {
            if ($location.search().remix) {
                $http.get(`/api/photo/${$location.search().remix}`).then((response) => {
                    let photo = response.data
                    ctrl.code = photo.code
                    ctrl.language = photo.language
                    ctrl.theme = photo.params.theme
                })
            }
        }
        return this
    }
})
