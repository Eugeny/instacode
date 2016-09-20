from rest_framework import mixins, viewsets

from ..models import User, Photo
from ..serializers import UserSerializer, PhotoSerializer


class UserViewSet(mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PhotoViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
