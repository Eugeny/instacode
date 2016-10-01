import base64
import datetime
import json
import os
from pygments.lexers import get_all_lexers
from pyatom import AtomFeed

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse

from ..models import Photo, User, Like
from ..instacode import Instacode


EXTRA_LEXERS = {
    'AT&T Assembly': 'GAS',
    'Intel Assembly': 'NASM',
}


def view_index(request):
    # force create session
    request.session['test'] = 1
    content = open(os.path.join(settings.BASE_DIR, 'static/build/index.html')).read()
    return HttpResponse(content=content)


def api_highlight(request):
    data = json.loads(request.body)
    code = data['code'] + '\n\n'
    language = data['language']
    theme = data.get('theme', 'monokai')

    if language in EXTRA_LEXERS:
        language = EXTRA_LEXERS[language]

    output = Instacode().run(code, language, style=theme)
    return HttpResponse(base64.b64encode(output))


def api_publish(request):
    data = json.loads(request.body)
    image = data['image']
    code = data['code']
    language = data['language']
    theme = data.get('theme', 'monokai')
    parameters = data['parameters']
    shaders = data['shaders']
    title = data['title']

    params = {
        'parameters': parameters,
        'shaders': shaders,
        'theme': theme,
    }

    p = Photo(
        code=code,
        title=title,
        language=language,
        params=params,
    )

    if request.user.is_authenticated():
        p.user = request.user
    else:
        print 'temp', request.session.session_key
        p.temp_owner = request.session.session_key

    p.save()

    p.write(None, base64.b64decode(image))
    Instacode().make_thumbnail(p)

    p.saved = True
    p.save()

    '''
    if request.user.is_authenticated():
        for followship in request.user.followers.all():
            FeedEntry(
                user=followship.follower,
                photo=p
            ).save()

    # Do maintenance
    FeedEntry.vacuum()
    '''

    return JsonResponse({
        'state': 'ok',
        'id': p.id,
    })


def api_bootstrap(request):
    return JsonResponse({
        'me': request.user.serialize() if not request.user.is_anonymous() else None,
        'languages': sorted([x[0] for x in get_all_lexers()] + EXTRA_LEXERS.keys()),
    })


def api_photo(request, id=None):
    photo = get_object_or_404(Photo, id=id)
    if request.method == 'GET':
        data = photo.serialize(with_user=True, with_content=True)
        data['liked'] = Like.objects.filter(
            photo=photo,
            user=request.user,
            ip=None if request.user else request.ip,
        ).exists()
        data['is_mine'] = photo.user and (request.user == photo.user)
        data['is_mine'] |= photo.temp_owner == request.session.session_key
        return JsonResponse(data)
    if request.method == 'DELETE':
        is_mine = False
        is_mine |= photo.user and (request.user == photo.user)
        is_mine |= photo.temp_owner == request.session.session_key
        if is_mine:
            photo.delete()
        return JsonResponse(None, safe=False)


def stream(request, id=None):
    photo = get_object_or_404(Photo, id=id)
    return HttpResponse(photo.read(), content_type='image/png')


def thumbnail(request, id=None):
    photo = get_object_or_404(Photo, id=int(id))
    return HttpResponse(photo.read('thumbnail', 'jpg'), content_type='image/jpeg')


def api_user(request, username=None):
    user = get_object_or_404(User, username=username)
    return JsonResponse(user.serialize(with_photos=True))


def api_like(request, id=None):
    photo = get_object_or_404(Photo, id=id)
    _, created = Like.objects.get_or_create(
        photo=photo,
        user=request.user,
        ip=None if request.user else request.ip,
    )
    if created:
        photo.like_count += 1
        photo.save()
    return JsonResponse({})


def api_dislike(request, id=None):
    photo = get_object_or_404(Photo, id=id)
    q = Like.objects.filter(
        photo=photo,
        user=request.user,
        ip=None if request.user else request.ip,
    )
    if q.exists():
        q.delete()
        photo.like_count -= 1
        photo.save()
    return JsonResponse({})


def feed(self, username=None):
    user = get_object_or_404(User, username=username)

    feed = AtomFeed(
        title="Instacode: %s" % username,
        feed_url="http://instaco.de/feed/%s" % username,
        url="http://instaco.de",
        author="Instacode"
    )

    for photo in user.photos.order_by('-id')[:100].all():
        feed.add(
            title=(photo.title or 'Untitled') + ' by %s' % user.username,
            content_type="html",
            author=username,
            url="http://instaco.de/%s" % photo.id,
            updated=photo.created_at
        )

    return HttpResponse(feed.to_string(), content_type='application/atom+xml')
