from flask import Blueprint, jsonify

from app.api.v1.auth.decorators import current_user_required
from app.api.v1.notifications.service import NotificationService

notifications_bp = Blueprint("notifications", __name__)


def serialize_notification(notification):
    return {
        "id": str(notification.id),
        "type": notification.notification_type.value,
        "title": notification.title,
        "message": notification.message,
        "event_id": (
            str(notification.event_id)
            if notification.event_id
            else None
        ),
        "booking_id": (
            str(notification.booking_id)
            if notification.booking_id
            else None
        ),
        "refund_id": (
            str(notification.refund_id)
            if notification.refund_id
            else None
        ),
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
        "read_at": (
            notification.read_at.isoformat()
            if notification.read_at
            else None
        ),
    }


@notifications_bp.get("/notifications")
@current_user_required
def list_notifications(user):
    notifications = NotificationService.list_for_user(user)

    return jsonify({
        "success": True,
        "count": len(notifications),
        "unread_count": NotificationService.unread_count(user),
        "data": [
            serialize_notification(notification)
            for notification in notifications
        ],
    }), 200


@notifications_bp.get("/notifications/unread-count")
@current_user_required
def get_unread_count(user):
    return jsonify({
        "success": True,
        "unread_count": NotificationService.unread_count(user),
    }), 200


@notifications_bp.patch(
    "/notifications/<uuid:notification_id>/read"
)
@current_user_required
def mark_notification_as_read(user, notification_id):
    try:
        notification = NotificationService.mark_as_read(
            user,
            notification_id,
        )

        return jsonify({
            "success": True,
            "message": "Notification marked as read.",
            "data": serialize_notification(notification),
        }), 200

    except LookupError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404


@notifications_bp.patch("/notifications/read-all")
@current_user_required
def mark_all_notifications_as_read(user):
    updated_count = NotificationService.mark_all_as_read(user)

    return jsonify({
        "success": True,
        "message": "All notifications marked as read.",
        "updated_count": updated_count,
    }), 200
