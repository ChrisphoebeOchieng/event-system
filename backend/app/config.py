import os
from datetime import timedelta


class Config:
    """Application configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://apple@localhost/event_system",
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173",
    ).split(",")

    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
