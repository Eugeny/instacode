from django.conf.urls import include
from django.conf.urls import url
from django.contrib import admin

from rest_framework_extensions.routers import (
    ExtendedSimpleRouter as SimpleRouter
)

from .views.api import UserViewSet, PhotoViewSet
from .views.auth import log_in, log_out, oauth_callback
from .views.main import index, bootstrap


api_router = SimpleRouter()
api_router.register(r'users', UserViewSet)
api_router.register(r'photos', PhotoViewSet)

urlpatterns = [
    url(r'^$', index),
    url(r'^api/', include(api_router.urls)),
    url(r'^admin/', admin.site.urls),
    url(r'^api/bootstrap', bootstrap),
    url(r'^login$', log_in),
    url(r'^logout$', log_out),
    url(r'^oauth_callback', oauth_callback),
]
