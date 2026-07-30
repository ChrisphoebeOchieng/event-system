from flask import Blueprint, jsonify

from app.api.v1.auth.decorators import (
    admin_required,
    organizer_required,
)
from app.api.v1.dashboard.service import DashboardService

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard/organizer")
@organizer_required
def organizer_dashboard(user):
    return jsonify({
        "success": True,
        "data": DashboardService.organizer_summary(user),
    }), 200


@dashboard_bp.get("/dashboard/admin")
@admin_required
def admin_dashboard(user):
    return jsonify({
        "success": True,
        "data": DashboardService.admin_summary(),
    }), 200
