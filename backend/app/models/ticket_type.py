import uuid
from datetime import datetime, timezone

from app.database import db


class TicketType(db.Model):
    __tablename__ = "ticket_types"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    event_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = db.Column(
        db.String(100),
        nullable=False,
    )

    description = db.Column(
        db.String(500),
        nullable=True,
    )

    price = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
    )

    sold_quantity = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    max_per_order = db.Column(
        db.Integer,
        nullable=False,
        default=10,
    )

    sales_start = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    sales_end = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    is_active = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
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

    event = db.relationship(
        "Event",
        backref=db.backref(
            "ticket_types",
            lazy="select",
            cascade="all, delete-orphan",
        ),
    )

    __table_args__ = (
        db.UniqueConstraint(
            "event_id",
            "name",
            name="uq_ticket_type_event_name",
        ),
        db.CheckConstraint(
            "price >= 0",
            name="ck_ticket_type_price_non_negative",
        ),
        db.CheckConstraint(
            "quantity > 0",
            name="ck_ticket_type_quantity_positive",
        ),
        db.CheckConstraint(
            "sold_quantity >= 0",
            name="ck_ticket_type_sold_non_negative",
        ),
        db.CheckConstraint(
            "sold_quantity <= quantity",
            name="ck_ticket_type_sold_within_quantity",
        ),
    )

    @property
    def available_quantity(self):
        return self.quantity - self.sold_quantity

    def __repr__(self):
        return f"<TicketType {self.name}>"
