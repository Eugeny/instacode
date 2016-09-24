class IpMiddleware(object):
    def process_request(self, request):
        request.ip = request.META.get('HTTP_X_FORWARDED_FOR', None) or request.META.get('REMOTE_ADDR', None)
        if not request.user.is_authenticated():
            request.user = None
