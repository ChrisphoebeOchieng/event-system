import enum
import uuid
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from app.database import db


class UserRole(enum.Enum):
    ADMIN = "admin"
    ORGANIZER = "organizer"
    ATTENDEE = "attendee"
    VENDOR = "vendor"


class AccountStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    first_name = db.Column(
        db.String(100),
        nullable=False,
    )

    last_name = db.Column(
        db.String(100),
        nullable=False,
    )

    username = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False,
    )

    profile_image = db.Column(
        db.String(500),
    )

    role = db.Column(
        db.Enum(UserRole),
        nullable=False,
        default=UserRole.ATTENDEE,
    )

    status = db.Column(
        db.Enum(AccountStatus),
        nullable=False,
        default=AccountStatus.PENDING,
    )

    email_verified = db.Column(
        db.Boolean,
        default=False,
    )

    last_login = db.Column(
        db.DateTime,
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

    is_deleted = db.Column(
        db.Boolean,
        default=False,
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(
            self.password_hash,
            password,
        )

    def __repr__(self):
        return f"<User {self.email}>"
