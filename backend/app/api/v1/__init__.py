from flask import Blueprint

from app.api.v1.auth.routes import auth_bp
from app.api.v1.events.routes import events_bp
from app.api.v1.ticket_types.routes import ticket_types_bp

api_v1 = Blueprint("api_v1", __name__)

api_v1.register_blueprint(
    auth_bp,
    url_prefix="/auth",
)

api_v1.register_blueprint(
    events_bp,
    url_prefix="/events",
)

api_v1.register_blueprint(ticket_types_bp)
