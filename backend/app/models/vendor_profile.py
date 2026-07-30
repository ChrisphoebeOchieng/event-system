import uuid
from datetime import datetime

from app.database import db


class VendorProfile(db.Model):
    __tablename__ = "vendor_profiles"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )

    business_name = db.Column(
        db.String(255),
        nullable=False,
    )

    business_type = db.Column(
        db.String(100),
        nullable=False,
    )

    description = db.Column(
        db.Text,
    )

    phone = db.Column(
        db.String(30),
        nullable=False,
    )

    city = db.Column(
        db.String(100),
        nullable=False,
    )

    country = db.Column(
        db.String(100),
        nullable=False,
        default="Kenya",
    )

    logo_url = db.Column(
        db.String(500),
    )

    is_approved = db.Column(
        db.Boolean,
        default=False,
        nullable=False,
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

    user = db.relationship(
        "User",
        backref=db.backref(
            "vendor_profile",
            uselist=False,
        ),
    )

    def __repr__(self):
        return f"<VendorProfile {self.business_name}>"
