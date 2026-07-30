from datetime import datetime, timezone

from app.database import db
from app.models.notification import Notification, NotificationType


class NotificationService:

    @staticmethod
    def create(
        user_id,
        title,
        message,
        notification_type=NotificationType.SYSTEM,
        event_id=None,
        booking_id=None,
        refund_id=None,
    ):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            event_id=event_id,
            booking_id=booking_id,
            refund_id=refund_id,
        )

        db.session.add(notification)
        return notification

    @staticmethod
    def list_for_user(user):
        return (
            Notification.query
            .filter_by(user_id=user.id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def get_for_user(user, notification_id):
        return Notification.query.filter_by(
            id=notification_id,
            user_id=user.id,
        ).first()

    @staticmethod
    def unread_count(user):
        return Notification.query.filter_by(
            user_id=user.id,
            is_read=False,
        ).count()

    @staticmethod
    def mark_as_read(user, notification_id):
        notification = NotificationService.get_for_user(
            user,
            notification_id,
        )

        if not notification:
            raise LookupError("Notification not found.")

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            db.session.commit()

        return notification

    @staticmethod
    def mark_all_as_read(user):
        unread_notifications = Notification.query.filter_by(
            user_id=user.id,
            is_read=False,
        ).all()

        read_time = datetime.now(timezone.utc)

        for notification in unread_notifications:
            notification.is_read = True
            notification.read_at = read_time

        db.session.commit()

        return len(unread_notifications)
