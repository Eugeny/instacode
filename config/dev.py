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

GITHUB_CLIENT_ID = '196c46bdd3af56df3e9b'
GITHUB_CLIENT_SECRET = '15d8242223f18f0bcb5ecac5abf44d9a09a6b54d'
GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize?client_id=%s&scope=user:email' % GITHUB_CLIENT_ID

SESSION_COOKIE_SECURE = False
