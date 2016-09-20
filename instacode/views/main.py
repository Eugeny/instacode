import os
from pygments.lexers import get_all_lexers

from django.conf import settings
from django.http import HttpResponse, JsonResponse

from ..serializers import UserSerializer


EXTRA_LEXERS = {
    'AT&T Assembly': 'GAS',
    'Intel Assembly': 'NASM',
}


def index(request):
    content = open(os.path.join(settings.BASE_DIR, 'static/build/index.html')).read()
    return HttpResponse(content=content)


def bootstrap(request):
    return JsonResponse({
        'me': UserSerializer(request.user).data if not request.user.is_anonymous() else None,
        'languages': sorted([x[0] for x in get_all_lexers()] + EXTRA_LEXERS.keys()),
    })
