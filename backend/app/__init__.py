import os

from dotenv import load_dotenv
from flask import Flask, jsonify

from app.api.v1 import api_v1
from app.config import config_by_name
from app.extensions import cors, db, jwt, migrate


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application."""

    load_dotenv()

    selected_config = config_name or os.getenv(
        "FLASK_ENV",
        "development",
    )

    app = Flask(__name__)
    app.config.from_object(
        config_by_name.get(
            selected_config,
            config_by_name["development"],
        )
    )

    register_extensions(app)
    register_blueprints(app)
    register_error_handlers(app)

    return app


def register_extensions(app: Flask) -> None:
    """Initialize Flask extensions."""

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": app.config.get(
                    "CORS_ORIGINS",
                    ["http://localhost:5173"],
                )
            }
        },
    )


def register_blueprints(app: Flask) -> None:
    """Register application blueprints."""

    app.register_blueprint(api_v1, url_prefix="/api/v1")


def register_error_handlers(app: Flask) -> None:
    """Register common JSON error responses."""

    @app.errorhandler(404)
    def handle_not_found(_error):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "The requested resource was not found.",
                }
            ),
            404,
        )

    @app.errorhandler(500)
    def handle_internal_error(_error):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "An unexpected server error occurred.",
                }
            ),
            500,
        )
