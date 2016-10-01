angular.module('app').component('uploader', {
    templateUrl: 'components/uploader.html',
    controller: function (bootstrap, $interval, $http, $q, $location, $window) {
        var ctrl = this
        ctrl.step = 'code'
        ctrl.theme = 'fruity'
        ctrl.title = ''
        ctrl.language = 'JavaScript'
        ctrl.spoilOpacity = [0, 0, 0, 0, 0, 0]
        ctrl.spoilRate = [0, 0, 0, 0, 0, 0]
        ctrl.spoilVisible = false


        ctrl.code = 'bootstrap.promise.then(() => {\n            ctrl.languages =\nbootstrap.languages\n            ctrl.me = bootstrap.me\n        })'

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
                $http.post('/api/highlight', {
                    code: ctrl.code,
                    language: ctrl.language,
                    theme: ctrl.theme,
                }).then((response) => {
                    console.log('image', response.data)
                    ctrl.spoilVisible = false

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
                position: [0, 0, -2.6],
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

            ctrl.controlModeDrag = false

            let controls = {}

            /*
            $('input[data-prop]').each (i, e) =>
                @controls[$(e).attr('data-prop')] = $(e)
                dep = $(e).attr('data-depend')
                if dep
                    if not @controls[dep].is(':checked')
                        $(e).next().hide()
                    $(e).next().css('margin-left': '25px')
                    @controls[dep].click () =>
                        $(e).next().toggle()
            */

            let updateRenderer = () => {
                ctrl.renderer.objectPosition = parameters.position
                ctrl.renderer.objectRotation = parameters.rotation
                //for k of @controls
                //    @ctrl.renderer.objectShaders[k] = @controls[k].is(':checked')
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
