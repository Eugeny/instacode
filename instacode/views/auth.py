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
    print '### LOGOUT'
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

    user.backend = 'django.contrib.auth.backends.ModelBackend'
    print dict(request.session)
    login(request, user)
    print
    print dict(request.session)
    print '### LOGIN', user

    return JUST_REGISTERED


def oauth_callback(request):
    if process_oauth_callback(request) == JUST_REGISTERED:
        for photo in Photo.objects.filter(temp_owner=request.session.session_key).all():
            photo.user = request.user
            photo.temp_owner = None
            photo.save()
        return HttpResponseRedirect(request.session.get('login_return', '/'))
    else:
        return HttpResponseRedirect('/')
