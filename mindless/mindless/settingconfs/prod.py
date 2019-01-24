from ..settings import *

SECRET_KEY = 'H5Hr&K8YGHnUAmCwxuD%NbeuXXoOC9dD3l&1vFynCBM#OOrOw8'
DEBUG = False
ALLOWED_HOSTS = ['mindless-app.com', '13.76.153.187',]
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'mindless',
        'USER': 'mindlessuser',
        'PASSWORD': 'u!6nGuQQK$Sq',
        'HOST': 'localhost',
        'PORT': '',
    }
}
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')
