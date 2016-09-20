from rest_framework import serializers
from .models import User, Photo


class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        fields = ('id', 'username', 'email', 'is_admin', 'is_active', 'photos',)


class PhotoSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Photo
        fields = ('id', 'code', 'language', 'like_count', 'title', 'user_id',)
