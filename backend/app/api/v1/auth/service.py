from flask_jwt_extended import create_access_token, create_refresh_token

from app.database import db
from app.models.user import AccountStatus, User, UserRole


class AuthService:

    @staticmethod
    def register(data):
        email = data["email"].lower().strip()
        username = data["username"].lower().strip()

        if User.query.filter_by(email=email).first():
            raise ValueError("Email already exists.")

        if User.query.filter_by(username=username).first():
            raise ValueError("Username already exists.")

        allowed_roles = {
            "attendee": UserRole.ATTENDEE,
            "organizer": UserRole.ORGANIZER,
            "vendor": UserRole.VENDOR,
        }

        role = allowed_roles.get(data["role"])

        if not role:
            raise ValueError("Invalid account role.")

        user = User(
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            username=username,
            email=email,
            role=role,
            status=AccountStatus.ACTIVE,
        )

        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        return user

    @staticmethod
    def login(data):
        email = data["email"].lower().strip()

        user = User.query.filter_by(email=email).first()

        if not user:
            raise ValueError("Invalid email or password.")

        if not user.check_password(data["password"]):
            raise ValueError("Invalid email or password.")

        access_token = create_access_token(
            identity=str(user.id)
        )

        refresh_token = create_refresh_token(
            identity=str(user.id)
        )

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
