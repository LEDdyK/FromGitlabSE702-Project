# Generated by Django 2.1 on 2018-09-11 20:59

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('hci', '0006_auto_20180907_0335'),
    ]

    operations = [
        migrations.AddField(
            model_name='participant',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='participant',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
