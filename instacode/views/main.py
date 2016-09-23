import json
import os
from pygments.lexers import get_all_lexers

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse

from ..models import Photo, User


EXTRA_LEXERS = {
    'AT&T Assembly': 'GAS',
    'Intel Assembly': 'NASM',
}


def view_index(request):
    content = open(os.path.join(settings.BASE_DIR, 'static/build/index.html')).read()
    return HttpResponse(content=content)


def api_publish(request):
    data = json.loads(request.body)
    # image = request.POST['image']
    code = data['code']
    language = data['language']
    theme = data.get('theme', 'monokai')
    parameters = data['parameters']
    shaders = data['shaders']
    title = data['title']

    if language in EXTRA_LEXERS:
        language = EXTRA_LEXERS[language]

    params = {
        'parameters': parameters,
        'shaders': shaders,
        'theme': theme,
    }

    p = Photo(
        temp_owner=request.session.session_key,
        code=code,
        title=title,
        language=language,
        params=json.dumps(params),
    )

    if request.user.is_authenticated():
        p.user = request.user

    p.save()

    # p.write(None, base64.b64decode(image))
    # Instacode().make_thumbnail(p)

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
    return JsonResponse(photo.serialize(with_user=True, with_content=True))


def api_user(request, id=None):
    user = get_object_or_404(User, id=id)
    return JsonResponse(user.serialize(with_photos=True))
