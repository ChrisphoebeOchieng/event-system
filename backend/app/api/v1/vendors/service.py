from app.database import db
from app.models.vendor_profile import VendorProfile


class VendorService:

    @staticmethod
    def get_profile(user):
        return VendorProfile.query.filter_by(
            user_id=user.id,
        ).first()

    @staticmethod
    def create_profile(user, data):
        existing_profile = VendorService.get_profile(user)

        if existing_profile:
            raise ValueError("Vendor profile already exists.")

        profile = VendorProfile(
            user_id=user.id,
            business_name=data["business_name"].strip(),
            business_type=data["business_type"],
            description=(
                data.get("description", "").strip()
                if data.get("description")
                else None
            ),
            phone=data["phone"].strip(),
            city=data["city"].strip(),
            country=data.get("country", "Kenya").strip(),
            logo_url=(
                data.get("logo_url", "").strip()
                if data.get("logo_url")
                else None
            ),
        )

        db.session.add(profile)
        db.session.commit()

        return profile

    @staticmethod
    def update_profile(user, data):
        profile = VendorService.get_profile(user)

        if not profile:
            raise LookupError("Vendor profile not found.")

        editable_fields = [
            "business_name",
            "business_type",
            "description",
            "phone",
            "city",
            "country",
            "logo_url",
        ]

        for field in editable_fields:
            if field in data:
                value = data[field]

                if isinstance(value, str):
                    value = value.strip()

                setattr(profile, field, value or None)

        db.session.commit()

        return profile

    @staticmethod
    def list_profiles():
        return (
            VendorProfile.query
            .order_by(VendorProfile.created_at.desc())
            .all()
        )

    @staticmethod
    def set_approval(profile_id, is_approved):
        profile = VendorProfile.query.filter_by(
            id=profile_id,
        ).first()

        if not profile:
            raise LookupError("Vendor profile not found.")

        profile.is_approved = is_approved
        db.session.commit()

        return profile

