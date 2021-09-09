angular.module('app').component('photoView', {
    bindings: {
        photo: '<'
    },
    templateUrl: 'components/photoView.html',
    controller: function ($http, $window, $uibModal, $location, bootstrap) {
        let ctrl = this

        bootstrap.promise.then(() => {
            ctrl.me = bootstrap.me
        })

        ctrl.location = window.location

        ctrl.toggleLike = () => {
            if (ctrl.photo.liked) {
                ctrl.photo.liked = false
                ctrl.photo.like_count -= 1
                $http.get(`/api/dislike/${ctrl.photo.id}`)
            } else {
                ctrl.photo.liked = true
                ctrl.photo.like_count += 1
                $http.get(`/api/like/${ctrl.photo.id}`)
            }
        }

        ctrl.showCode = () => {
            $uibModal.open({
                component: 'code-modal',
                resolve: {
                    photo: () => ctrl.photo
                },
                backdrop: 'static',
            })
        }

        ctrl.delete = () => {
            if (confirm('Delete this post?')) {
                $http.delete(`/api/photo/${ctrl.photo.id}`).then(() => {
                    $location.path('/')
                })
            }
        }

        $('.muut').muut({
            url: `https://muut.com/i/instacode/comments/photo:${ctrl.photo.id}`,
            title: `${ctrl.photo.id}: ${ctrl.photo.title}`,
            share: false,
            show_online: false,
            upload: false,
            widget: true,
            page_url: `http://instaco.de/${ctrl.photo.id}`,
        })
        return ctrl
    }
})
