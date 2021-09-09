#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: Keep the secret key used in production secret!
SECRET_KEY = 'xxx'

# SECURITY WARNING: Don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_extensions',
    'corsheaders',

    'instacode',
]

MIDDLEWARE_CLASSES = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'instacode.middleware.IpMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'instacode.urls'

# Static files (CSS, JavaScript, Images etc.)
# @see: https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static/'),
]

STATIC_ROOT = os.path.join(BASE_DIR, 'public/static/')

WSGI_APPLICATION = 'wsgi.application'

# Custom authentication user model
# @see: https://docs.djangoproject.com/en/1.9/topics/auth/customizing/#substituting-a-custom-user-model
AUTH_USER_MODEL = 'instacode.User'

# Logging configuration
# @see: https://docs.djangoproject.com/en/1.9/topics/logging/
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s',
            'datefmt': '%d/%b/%Y %H:%M:%S',
        },
        'simple': {
            'format': '%(levelname)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'INFO',
            # 'level': 'DEBUG',
        },
    }
}

# Internationalization
# @see: https://docs.djangoproject.com/en/1.9/topics/i18n/
LANGUAGE_CODE = 'en-us'
USE_I18N = False
USE_L10N = False

TIME_ZONE = 'UTC'
USE_TZ = True

# CORS:
# @see: https://github.com/ottoyiu/django-cors-headers
CORS_ORIGIN_ALLOW_ALL = True


GITHUB_CLIENT_ID = 'xxx'
GITHUB_CLIENT_SECRET = 'xxx'
GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize?client_id=%s&scope=user:email' % GITHUB_CLIENT_ID
GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

LOGIN_URL = '/login'
LOGIN_REDIRECT_URL = '/'
LOGOUT_URL = '/logout'
