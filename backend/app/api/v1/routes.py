from datetime import datetime, timezone

from flask import Blueprint, jsonify

api_v1 = Blueprint("api_v1", __name__)


@api_v1.get("/health")
def health_check():
    """Return the current status of the API."""

    return (
        jsonify(
            {
                "success": True,
                "message": "Event System API is operational.",
                "data": {
                    "service": "event-system-api",
                    "status": "healthy",
                    "version": "1.0.0",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            }
        ),
        200,
    )
