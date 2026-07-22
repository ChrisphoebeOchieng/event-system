import enum
import uuid
from datetime import datetime, timezone

from app.database import db


class PaymentMethod(enum.Enum):
    MPESA = "mpesa"
    CARD = "card"
    CASH = "cash"


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(db.Model):
    __tablename__ = "payments"

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

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    method = db.Column(
        db.Enum(PaymentMethod),
        nullable=False,
    )

    status = db.Column(
        db.Enum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.PENDING,
    )

    transaction_reference = db.Column(
        db.String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    phone_number = db.Column(
        db.String(20),
        nullable=True,
    )

    paid_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
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
            "payment",
            uselist=False,
            cascade="all, delete-orphan",
        ),
    )

    user = db.relationship(
        "User",
        backref=db.backref("payments", lazy="select"),
    )

    __table_args__ = (
        db.CheckConstraint(
            "amount >= 0",
            name="ck_payment_amount_non_negative",
        ),
    )

    def __repr__(self):
        return f"<Payment {self.transaction_reference}>"
