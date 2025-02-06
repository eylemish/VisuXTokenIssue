"""
Django settings for backend project.
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-jva$dsl4gi2-&q@+k(q(@9nn+y(1$*_0!0q(t%9+rw^_m&)e1c'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# 允许所有的主机访问（仅限开发环境）
ALLOWED_HOSTS = ["*"]

# **1️⃣ 允许所有前端地址作为 CSRF 可信来源**
CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
] + [f"http://localhost:{port}" for port in range(3000, 90000)]  # 允许 localhost 端口 3000-90000 访问

# **2️⃣ 允许所有跨域请求（仅开发环境）**
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    f"http://localhost:{port}" for port in range(3000, 90001)
] + [
    f"http://127.0.0.1:{port}" for port in range(3000, 90001)
]

CORS_ALLOW_CREDENTIALS = True  # 允许前端跨域携带 Cookie 或 Session

# **3️⃣ CSRF Cookie 配置**
CSRF_COOKIE_NAME = "csrftoken"
CSRF_USE_SESSIONS = False
CSRF_COOKIE_SECURE = False  # 允许 HTTP 访问 CSRF Cookie
CSRF_COOKIE_HTTPONLY = False  # 允许 JavaScript 访问 CSRF Token
CSRF_COOKIE_SAMESITE = None  # 允许跨站请求

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',   # Django REST Framework
    'corsheaders',      # 解决跨域问题
    'backend.api',              # 我们创建的应用
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # **确保 CORS Middleware 在最前**
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
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
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
