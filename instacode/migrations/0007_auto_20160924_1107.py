# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-09-24 11:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('instacode', '0006_auto_20160923_2138'),
    ]

    operations = [
        migrations.AlterField(
            model_name='like',
            name='ip',
            field=models.CharField(blank=True, db_index=True, max_length=63, null=True),
        ),
        migrations.AlterField(
            model_name='photo',
            name='like_count',
            field=models.IntegerField(db_index=True, default=0, verbose_name=b'Like count'),
        ),
    ]