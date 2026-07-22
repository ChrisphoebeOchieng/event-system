import uuid
from datetime import datetime

from app.database import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name = db.Column(
        db.String(100),
        unique=True,
        nullable=False,
    )

    slug = db.Column(
        db.String(100),
        unique=True,
        nullable=False,
    )

    description = db.Column(
        db.Text,
    )

    icon = db.Column(
        db.String(255),
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    events = db.relationship(
        "Event",
        back_populates="category",
        lazy=True,
    )

    def __repr__(self):
        return f"<Category {self.name}>"
