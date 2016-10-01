import os

from django.conf import settings
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.db import models

from .util import JSONField


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(object):
        abstract = True


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username=None, email=None, password=None):
        user = self.create_user(username, email, password=password)
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(BaseModel,
           AbstractBaseUser,
           PermissionsMixin):
    objects = UserManager()

    username = models.CharField(max_length=255, unique=True)

    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    following = models.ManyToManyField('self', related_name='followers')

    USERNAME_FIELD = 'username'

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

    @property
    def is_staff(self):
        return self.is_admin

    def serialize(self, with_photos=False):
        data = {
            'id': self.id,
            'username': self.username,
            'is_admin': self.is_admin,
            'created_at': self.created_at,
        }
        if with_photos:
            data['photos'] = [x.serialize(with_content=True) for x in self.photos.filter(saved=True).all()]
        return data


class Photo (BaseModel):
    user = models.ForeignKey(User, related_name='photos', blank=True, null=True)
    title = models.CharField('Title', max_length=1024, default='', blank=True)
    like_count = models.IntegerField('Like count', default=0, db_index=True)
    code = models.TextField('Code', blank=True, null=True)
    language = models.CharField('Language', max_length=255, blank=True, null=True)
    params = JSONField('Parameters', default=None, blank=True, null=True)
    temp_owner = models.CharField('Temporary owner session ID', max_length=255, db_index=True, blank=True, null=True)
    saved = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s (%s)' % (self.title, self.user)

    def serialize(self, with_content=False, with_user=False):
        data = {
            'id': self.id,
            'title': self.title,
            'like_count': self.like_count,
            'created_at': self.created_at,
        }
        if with_content:
            data['language'] = self.language
            data['code'] = self.code
            data['params'] = self.params
        if with_user and self.user:
            data['user'] = self.user.serialize()
        return data

    def get_path(self, type=None, ext='png'):
        dir = '%i/%i/%i' % (self.id / 1024 / 1024, self.id / 1024 % 1024, self.id % 1024)
        return '%s/%s/%i%s.%s' % (settings.FILE_DIR, dir, int(self.id), ('-' + type if type else ''), ext)

    def exists(self, type=None, ext='png'):
        return os.path.exists(self.get_path(type, ext))

    def read(self, type=None, ext='png'):
        try:
            f = open(self.get_path(type, ext))
        except:
            try:
                f = open(self.get_path())
            except:
                return ''
        return f.read()

    def write(self, type, data):
        dir = os.path.split(self.get_path(type))[0]
        try:
            os.makedirs(dir)
        except:
            pass
        open(self.get_path(type), 'w').write(data)


class Like (BaseModel):
    user = models.ForeignKey(User, related_name='likes', null=True, blank=True)
    photo = models.ForeignKey(Photo, related_name='likes')
    ip = models.CharField(max_length=63, db_index=True, null=True, blank=True)
