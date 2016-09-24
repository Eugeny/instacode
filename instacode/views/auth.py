import time
import requests

from django.conf import settings
from django.contrib.auth import logout, login
from django.http import HttpResponseRedirect

from ..models import Photo, User

JUST_REGISTERED = 'just-registered'


def log_in(request):
    request.session['oauth_debug'] = False
    if request.GET.get('debug', False):
        request.session['oauth_debug'] = True
    request.session['oauth_state'] = str(time.time())
    request.session['login_return'] = request.GET.get('next', None) or request.GET.get('return', '/')
    return HttpResponseRedirect(settings.GITHUB_OAUTH_URL + '&state=%s' % request.session['oauth_state'])


def log_out(request):
    logout(request)
    return HttpResponseRedirect(request.GET.get('return', '/'))


def process_oauth_callback(request):
    try:
        j = None
        j = requests.post(settings.GITHUB_TOKEN_URL, data={
            'state': request.GET['state'],
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': request.GET['code'],
        }, headers={'Accept': 'application/json'}).json()
        token = j['access_token']
    except KeyError:
        return j

    user = requests.get('https://api.github.com/user?access_token=%s' % token).json()

    username = user['login']

    if 'email' not in user or not user['email']:
        email = ''
    else:
        email = user['email']

    try:
        user = User.objects.get(username=username)
    except:
        # welcome
        user = User.objects.create_user(
            username=username,
            email=email,
        )

    sk = request.session.session_key
    user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)
    request.session['old_key'] = sk

    return JUST_REGISTERED


def oauth_callback(request):
    if process_oauth_callback(request) == JUST_REGISTERED:
        sk = request.session.get('old_key', None)
        if sk:
            for photo in Photo.objects.filter(temp_owner=sk).all():
                photo.user = request.user
                photo.temp_owner = None
                photo.save()
        return HttpResponseRedirect(request.session.get('login_return', '/'))
    else:
        return HttpResponseRedirect('/')
