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

        bootstrap.promise.then(() => {
            ctrl.languages = bootstrap.languages
            ctrl.me = bootstrap.me
        })


        ctrl.goToStep = (step) => {
            ctrl.step = step

            if (step == 'style') {
                ctrl.spoilVisible = true
            }

        }

        ctrl.doPublish = () => {
            data = {
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

        return this
    }
})
