angular.module('app').directive('editor', ($q) => {
    return {
        restrict: 'A',
        controllerAs: '$ctrl',
        scope: {
            editor: '='
        },
        link: function ($scope, display) {
            let ctrl = this
            let assets = {
                pixels: $('#asset-pixels')[0],
                noise: $('#asset-noise')[0],
            }
            display = display[0]
            ctrl.renderer = new Renderer(display, assets)

            ctrl.parameters = {
                position: [0, 0, -1.6],
                rotation: [0, 0],
            }

            let lastClientXL
            let lastClientYL
            $(display).draggable({
                helper: () => $('<b></b>'),
                start: (e, ui) => {
                    lastClientXL = e.clientX
                    lastClientYL = e.clientY
                },
                drag: (e, ui) => {
                    let dx = e.clientX - lastClientXL
                    let dy = e.clientY - lastClientYL

                    if (ctrl.controlModeDrag) {
                        ctrl.parameters.position[0] += dx / -500.0 * ctrl.parameters.position[2]
                        ctrl.parameters.position[1] -= dy / -500.0 * ctrl.parameters.position[2]
                    } else {
                        ctrl.parameters.rotation[0] += dx / 200.0
                        ctrl.parameters.rotation[1] += dy / 200.0
                    }

                    lastClientXL = e.clientX
                    lastClientYL = e.clientY
                    updateRenderer()
                    return null
                }
            })

            $(display).bind('mousewheel DOMMouseScroll MozMousePixelScroll', (e) => {
                let delta = e.originalEvent.detail || e.originalEvent.wheelDelta
                delta = (parseInt(delta) > 0) ? 1 : -1
                z = ctrl.parameters.position[2]
                z = Math.max(-10, Math.min(-0.05, z * ((delta < 0) ? 1.1 : 0.9)))
                ctrl.parameters.position[2] = z
                updateRenderer()
                e.preventDefault()
            })

            ctrl.controlModeDrag = true

            let updateRenderer = () => {
                ctrl.renderer.objectPosition = ctrl.parameters.position
                ctrl.renderer.objectRotation = ctrl.parameters.rotation
            }

            updateRenderer()

            ctrl.getImage = () => {
                let q = $q.defer()
                ctrl.renderer.nextFrameCallback = () => {
                    url = display.toDataURL()
                    b64 = url.split(',')[1]
                    q.resolve(b64)
                }
                return q.promise
            }

            $scope.editor = ctrl
            return ctrl
        }
    }
})
