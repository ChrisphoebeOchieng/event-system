from flask import Blueprint, jsonify

from app.api.v1.auth.decorators import organizer_required
from app.api.v1.dashboard.service import DashboardService

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard/organizer")
@organizer_required
def organizer_dashboard(user):
    summary = DashboardService.organizer_summary(user)

    return jsonify({
        "success": True,
        "data": summary,
    }), 200
