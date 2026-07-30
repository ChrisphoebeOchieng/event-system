from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models.user import AccountStatus, User


def current_user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()

        user = User.query.get(get_jwt_identity())

        if not user or user.is_deleted:
            return jsonify({
                "success": False,
                "message": "User not found.",
            }), 404

        if user.status == AccountStatus.SUSPENDED:
            return jsonify({
                "success": False,
                "message": "Your account has been suspended.",
            }), 403

        if user.status == AccountStatus.INACTIVE:
            return jsonify({
                "success": False,
                "message": "Your account is inactive.",
            }), 403

        return fn(user, *args, **kwargs)

    return wrapper


def roles_required(*allowed_roles):
    allowed_values = {
        role.value if hasattr(role, "value") else str(role)
        for role in allowed_roles
    }

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()

            user = User.query.get(get_jwt_identity())

            if not user or user.is_deleted:
                return jsonify({
                    "success": False,
                    "message": "User not found.",
                }), 404

            if user.status == AccountStatus.SUSPENDED:
                return jsonify({
                    "success": False,
                    "message": "Your account has been suspended.",
                }), 403

            if user.status == AccountStatus.INACTIVE:
                return jsonify({
                    "success": False,
                    "message": "Your account is inactive.",
                }), 403

            if user.role.value not in allowed_values:
                return jsonify({
                    "success": False,
                    "message": "You do not have permission to access this resource.",
                }), 403

            return fn(user, *args, **kwargs)

        return wrapper

    return decorator


def organizer_required(fn):
    return roles_required("organizer", "admin")(fn)


def admin_required(fn):
    return roles_required("admin")(fn)


def vendor_required(fn):
    return roles_required("vendor", "admin")(fn)


def attendee_required(fn):
    return roles_required("attendee", "admin")(fn)
