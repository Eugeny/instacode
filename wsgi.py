#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.prod')
application = get_wsgi_application()
