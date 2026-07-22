import os

from dotenv import load_dotenv
from flask import Flask, jsonify

from app.api.v1 import api_v1
from app.config import config_by_name
from app.database import db, migrate
from app.extensions import cors, jwt

# IMPORTANT: Load all models
from app.models import *


def create_app(config_name=None):
    load_dotenv()

    app = Flask(__name__)

    config_name = config_name or os.getenv(
        "FLASK_ENV",
        "development",
    )

    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)

    jwt.init_app(app)

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"]
            }
        },
    )

    app.register_blueprint(
        api_v1,
        url_prefix="/api/v1",
    )

    @app.errorhandler(404)
    def not_found(_):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Resource not found.",
                }
            ),
            404,
        )

    @app.errorhandler(500)
    def internal_error(_):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Internal server error.",
                }
            ),
            500,
        )

    return app
