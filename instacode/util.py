import functools
import django.db.models.signals
import jsonfield


def autoconnect(cls):
    def connect(signal, func):
        @functools.wraps(func)
        def wrapper(sender, **kwargs):
            return func(kwargs.pop('instance'), **kwargs)
        signalf = getattr(django.db.models.signals, signal)
        signalf.connect(wrapper, sender=cls, dispatch_uid=('%s__%s' % (cls.__name__, signal)))
        return wrapper

    for signal in ['pre_save', 'post_save', 'pre_delete', 'post_delete']:
        if hasattr(cls, signal):
            setattr(cls, signal, connect(signal, getattr(cls, signal)))

    return cls


class JSONField (jsonfield.JSONField):
    def pre_init(self, value, obj):
        try:
            return jsonfield.JSONField.pre_init(self, value, obj)
        except:
            return self.default
