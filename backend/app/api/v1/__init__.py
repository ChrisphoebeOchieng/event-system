from flask import Blueprint

from app.api.v1.auth.routes import auth_bp

api_v1 = Blueprint("api_v1", __name__)

api_v1.register_blueprint(
    auth_bp,
    url_prefix="/auth",
)
