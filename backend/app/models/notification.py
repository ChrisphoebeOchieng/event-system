import enum
import uuid
from datetime import datetime, timezone

from app.database import db


class NotificationType(enum.Enum):
    BOOKING = "booking"
    PAYMENT = "payment"
    REFUND = "refund"
    EVENT = "event"
    VENDOR = "vendor"
    SYSTEM = "system"


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    notification_type = db.Column(
        db.Enum(NotificationType),
        nullable=False,
        default=NotificationType.SYSTEM,
    )

    title = db.Column(
        db.String(255),
        nullable=False,
    )

    message = db.Column(
        db.Text,
        nullable=False,
    )

    event_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("events.id", ondelete="CASCADE"),
        nullable=True,
    )

    booking_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=True,
    )

    refund_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("refunds.id", ondelete="CASCADE"),
        nullable=True,
    )

    is_read = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    read_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "notifications",
            lazy="select",
            cascade="all, delete-orphan",
        ),
    )

    event = db.relationship("Event")
    booking = db.relationship("Booking")
    refund = db.relationship("Refund")

    def __repr__(self):
        return f"<Notification {self.title}>"
