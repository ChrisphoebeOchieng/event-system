import enum
import uuid
from datetime import datetime, timezone

from app.database import db


class RefundStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class Refund(db.Model):
    __tablename__ = "refunds"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    booking_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    payment_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reason = db.Column(
        db.Text,
        nullable=False,
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    status = db.Column(
        db.Enum(RefundStatus),
        nullable=False,
        default=RefundStatus.PENDING,
    )

    admin_note = db.Column(
        db.Text,
        nullable=True,
    )

    requested_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    processed_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    booking = db.relationship(
        "Booking",
        backref=db.backref(
            "refund",
            uselist=False,
            cascade="all, delete-orphan",
        ),
    )

    payment = db.relationship(
        "Payment",
        backref=db.backref(
            "refund",
            uselist=False,
            cascade="all, delete-orphan",
        ),
    )

    user = db.relationship(
        "User",
        backref=db.backref("refunds", lazy="select"),
    )

    __table_args__ = (
        db.CheckConstraint(
            "amount >= 0",
            name="ck_refund_amount_non_negative",
        ),
    )

    def __repr__(self):
        return f"<Refund {self.id} {self.status.value}>"
