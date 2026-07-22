from flask import Blueprint, jsonify

events_bp = Blueprint("events", __name__)

@events_bp.post("/")
def create_event():
    return jsonify({
        "success": True,
        "message": "Events route is working."
    }), 200
