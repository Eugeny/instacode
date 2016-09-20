from django.contrib import admin
from .models import User, Photo, Like


class UserAdmin(admin.ModelAdmin):
    pass

admin.site.register(User, UserAdmin)
admin.site.register(Photo)
admin.site.register(Like)
