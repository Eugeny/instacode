from settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'instacode2',
        'USER': 'dev',
        'PASSWORD': '123',
        'HOST': 'localhost',
        'PORT': '',
    },
}

GITHUB_CLIENT_ID = 'xxx'
GITHUB_CLIENT_SECRET = 'xxx'
GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize?client_id=%s&scope=user:email' % GITHUB_CLIENT_ID

SESSION_COOKIE_SECURE = False

FILE_DIR = './data'
