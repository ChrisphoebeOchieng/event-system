import enum
import uuid
from datetime import datetime

from app.database import db


class EventStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class EventVisibility(enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title = db.Column(db.String(255), nullable=False)

    slug = db.Column(
        db.String(255),
        unique=True,
        nullable=False,
    )

    description = db.Column(
        db.Text,
        nullable=False,
    )

    banner_image = db.Column(db.String(500))

    venue = db.Column(
        db.String(255),
        nullable=False,
    )

    city = db.Column(
        db.String(100),
        nullable=False,
    )

    country = db.Column(
        db.String(100),
        nullable=False,
    )

    latitude = db.Column(db.Float)

    longitude = db.Column(db.Float)

    start_date = db.Column(
        db.DateTime,
        nullable=False,
    )

    end_date = db.Column(
        db.DateTime,
        nullable=False,
    )

    capacity = db.Column(
        db.Integer,
        nullable=False,
    )

    tickets_remaining = db.Column(
        db.Integer,
        nullable=False,
    )

    featured = db.Column(
        db.Boolean,
        default=False,
    )

    visibility = db.Column(
        db.Enum(EventVisibility),
        default=EventVisibility.PUBLIC,
    )

    status = db.Column(
        db.Enum(EventStatus),
        default=EventStatus.DRAFT,
    )

    organizer_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False,
    )

    category_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("categories.id"),
        nullable=False,
    )

    organizer = db.relationship(
        "User",
        backref="organized_events",
    )

    category = db.relationship(
        "Category",
        back_populates="events",
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def __repr__(self):
        return f"<Event {self.title}>"
