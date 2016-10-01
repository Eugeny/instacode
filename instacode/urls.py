from django.conf.urls import url
from django.contrib import admin

from .views.auth import log_in, log_out, oauth_callback
from .views.main import view_index, api_bootstrap, api_feeds, api_highlight, api_publish, api_photo, stream, thumbnail, api_user, api_like, api_dislike, feed


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^$', view_index),
    url(r'^api/bootstrap$', api_bootstrap),
    url(r'^api/feeds$', api_feeds),
    url(r'^api/highlight$', api_highlight),
    url(r'^api/publish$', api_publish),
    url(r'^api/photo/(?P<id>\d+)$', api_photo),
    url(r'^api/user/(?P<username>.+)$', api_user),
    url(r'^api/like/(?P<id>\d+)$', api_like),
    url(r'^api/dislike/(?P<id>\d+)$', api_dislike),
    url(r'^feed/(?P<username>.+)$', feed),
    url(r'^stream/(?P<id>\d+)$', stream),
    url(r'^thumbnail/(?P<id>\d+)$', thumbnail),

    url(r'^login$', log_in),
    url(r'^logout$', log_out),
    url(r'^oauth_callback', oauth_callback),

    url(r'^.+$', view_index),
]
