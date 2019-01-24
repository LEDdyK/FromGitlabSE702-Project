from ..settings import *

SECRET_KEY = '4gym4u93!1of@3$q31^xn7wssa41fphz9bxkk0baa++g-x!3ia'
DEBUG = True
ALLOWED_HOSTS = []
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]