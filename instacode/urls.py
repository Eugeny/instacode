from django.conf.urls import url
from django.contrib import admin

from .views.auth import log_in, log_out, oauth_callback
from .views.main import view_index, api_bootstrap, api_publish, api_photo, api_user


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^$', view_index),
    url(r'^api/bootstrap$', api_bootstrap),
    url(r'^api/publish$', api_publish),
    url(r'^api/photo/(?P<id>\d+)$', api_photo),
    url(r'^api/user/(?P<id>\d+)$', api_user),

    url(r'^login$', log_in),
    url(r'^logout$', log_out),
    url(r'^oauth_callback', oauth_callback),

    url(r'^.+$', view_index),
]
