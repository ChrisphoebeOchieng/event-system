import enum
import uuid
from datetime import datetime, timezone

from app.database import db


class BookingStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Booking(db.Model):
    __tablename__ = "bookings"

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

    event_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    ticket_type_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("ticket_types.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
    )

    unit_price = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    total_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    status = db.Column(
        db.Enum(BookingStatus),
        nullable=False,
        default=BookingStatus.PENDING,
    )

    booking_reference = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        index=True,
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

    user = db.relationship(
        "User",
        backref=db.backref("bookings", lazy="select"),
    )

    event = db.relationship(
        "Event",
        backref=db.backref("bookings", lazy="select"),
    )

    ticket_type = db.relationship(
        "TicketType",
        backref=db.backref("bookings", lazy="select"),
    )

    __table_args__ = (
        db.CheckConstraint(
            "quantity > 0",
            name="ck_booking_quantity_positive",
        ),
        db.CheckConstraint(
            "unit_price >= 0",
            name="ck_booking_unit_price_non_negative",
        ),
        db.CheckConstraint(
            "total_amount >= 0",
            name="ck_booking_total_non_negative",
        ),
    )

    def __repr__(self):
        return f"<Booking {self.booking_reference}>"
