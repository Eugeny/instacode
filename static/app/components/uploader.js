angular.module('app').component('uploader', {
    templateUrl: 'components/uploader.html',
    controller: function (bootstrap, $interval, $timeout, $http, $q, $location, $window) {
        var ctrl = this
        ctrl.step = 'code'
        ctrl.theme = 'fruity'
        ctrl.title = ''
        ctrl.language = 'JavaScript'
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

        // TODO
        ctrl.language = 'Python'
        ctrl.code = `
class Instacode:
    def run(self, code, language=None, font='Ubuntu Mono', style='solarized256'):
        style = STYLE_CLASS_MAP.get(style, style)

        code = '\\n' + '\\n'.join(
            ('  ' + x[:max_width] + '  ')
            for x in code.splitlines()[:max_height]
        ) + '\\n'

        formatter = ImageFormatter(font_name=font, font_size=36, style=style, line_numbers=False, image_pad=20, line_pad=12)
        result = highlight(code, lexer, formatter)
                `

        bootstrap.promise.then(() => {
            ctrl.languages = bootstrap.languages
            ctrl.me = bootstrap.me
        })


        let loadImage = (url) => {
            let img = new Image()
            img.src = url
            img.onload = () => {
                ctrl.renderer.setTexture(img)
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
                    console.log('image', response.data)
                    ctrl.spoilEnabled = false
                    $timeout(() => {
                        ctrl.spoilVisible = false
                    }, 1500)

                    ctrl.renderer.resize(400, 400)
                    loadImage('data:image/png;base64,' + response.data)
                }, () => {
                    // TODO
                })
            }
        }

        ctrl.doPublish = () => {
            data = {
                image: ctrl.getImage(),
                code: ctrl.code,
                language: ctrl.language,
                theme: ctrl.theme,
                title: ctrl.title,
                parameters: {},
                shaders: {},
            }
            return $http.post('/api/publish', data).then((response) => {
                if (response.data.state != 'ok')
                    return $q.reject()
                return response.data
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
            let i = Math.round(Math.random() * 6)
            ctrl.spoilOpacity[i] = Math.random() / (i + 1)
        }, 50)

        ctrl.$onDestroy = () => {
            $interval.cancel(spoilInterval)
        }

        ctrl.$onInit = () => {
            let assets = {
                pixels: $('#asset-pixels')[0],
                noise: $('#asset-noise')[0],
            }
            let display = $('canvas')
            ctrl.renderer = new Renderer(display[0], assets)

            let parameters = {
                position: [0, 0, -1.6],
                rotation: [0, 0],
            }

            let lastClientXL
            let lastClientYL
            display.draggable({
                helper: () => $('<b></b>'),
                start: (e, ui) => {
                    lastClientXL = e.clientX
                    lastClientYL = e.clientY
                },
                drag: (e, ui) => {
                    let dx = e.clientX - lastClientXL
                    let dy = e.clientY - lastClientYL

                    if (ctrl.controlModeDrag) {
                        parameters.position[0] += dx / -500.0 * parameters.position[2]
                        parameters.position[1] -= dy / -500.0 * parameters.position[2]
                    } else {
                        parameters.rotation[0] += dx / 200.0
                        parameters.rotation[1] += dy / 200.0
                    }

                    lastClientXL = e.clientX
                    lastClientYL = e.clientY
                    updateRenderer()
                    return null
                }
            })

            display.bind('mousewheel DOMMouseScroll MozMousePixelScroll', (e) => {
                let delta = e.originalEvent.detail || e.originalEvent.wheelDelta
                delta = (parseInt(delta) > 0) ? 1 : -1
                z = parameters.position[2]
                z = Math.max(-10, Math.min(-0.05, z * ((delta < 0) ? 1.1 : 0.9)))
                parameters.position[2] = z
                updateRenderer()
                e.preventDefault()
            })

            ctrl.controlModeDrag = true

            let updateRenderer = () => {
                ctrl.renderer.objectPosition = parameters.position
                ctrl.renderer.objectRotation = parameters.rotation
            }

            updateRenderer()

            ctrl.getImage = () => {
                url = display[0].toDataURL()
                b64 = url.split(',')[1]
                return b64
            }

        }
        return this
    }
})
