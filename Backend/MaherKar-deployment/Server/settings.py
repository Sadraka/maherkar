from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-m)26e#hrj8=o4geq-hvc_tpd_l3v#_12*6avu1xt*h)l=it1k_'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Libarary
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Custom apps
    'Users.apps.UsersConfig',
    'Resumes.apps.ResumesConfig',
    'Profiles.apps.ProfilesConfig',
    'Industry.apps.IndustryConfig',
    'Companies.apps.CompaniesConfig',
    'Locations.apps.LocationsConfig',
    'Authentication.apps.AuthenticationConfig',
    'Advertisements.apps.AdvertisementsConfig',
    'Subscriptions.apps.SubscriptionsConfig',
    'Reports.apps.ReportsConfig',
    'Payments.apps.PaymentsConfig',
    'Orders.apps.OrdersConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'Server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Server.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
MEDIA_URL = 'media/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Auth User Model
AUTH_USER_MODEL = 'Users.User'


# Rest framework
REST_FRAMEWORK = {
    #  Authentications classes
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# JWT settings
SIMPLE_JWT = {
    #  Tokens life time
    'ACCESS_TOKEN_LIFETIME': timedelta(days=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=60),

    #  Refresh tokens
    'ROTATE_REFRESH_TOKENS': True,

    # Blacklist
    'BLACKLIST_AFTER_ROTATION': True,

    # Last Login refreshing
    'UPDATE_LAST_LOGIN': True,

    # Algorithm
    'ALGORITHM': 'HS256',

    # Verifying key
    'VERIFYING_KEY': None,

    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    # Headers
    'AUTH_HEADER_TYPES': ('Bearer',),     # Header type
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',   # Header name

    # User id setting
    'USER_ID_FIELD': 'id',         # Field
    'USER_ID_CLAIM': 'user_id',    # Claim

    #  Auth rules settings
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    # Auth token classes and settings
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',

    #  Sliding settings
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    # Token sliding lifetime
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

CORS_ALLOW_ALL_ORIGINS = True


KAVENEGAR_API_KEY = '77466A716A325A41625A556656616F4F5077524F34726D62487233304B493335325153446C57572B316C633D'


# SANDBOX MODE
MERCHANT = "00000000-0000-0000-0000-000000000000"
SANDBOX = True


CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
]

CORS_ALLOW_ALL_ORIGINS = True
