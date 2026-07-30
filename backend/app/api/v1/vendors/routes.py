from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.v1.auth.decorators import admin_required, vendor_required
from app.api.v1.vendors.schemas import (
    UpdateVendorProfileSchema,
    VendorProfileSchema,
)
from app.api.v1.vendors.service import VendorService

vendors_bp = Blueprint("vendors", __name__)

create_schema = VendorProfileSchema()
update_schema = UpdateVendorProfileSchema()


def serialize_vendor(profile):
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "business_name": profile.business_name,
        "business_type": profile.business_type,
        "description": profile.description,
        "phone": profile.phone,
        "city": profile.city,
        "country": profile.country,
        "logo_url": profile.logo_url,
        "is_approved": profile.is_approved,
        "created_at": profile.created_at.isoformat(),
        "updated_at": (
            profile.updated_at.isoformat()
            if profile.updated_at
            else None
        ),
    }


@vendors_bp.post("/vendors/profile")
@vendor_required
def create_vendor_profile(user):
    try:
        data = create_schema.load(request.get_json() or {})
        profile = VendorService.create_profile(user, data)

        return jsonify({
            "success": True,
            "message": "Vendor profile created successfully.",
            "data": serialize_vendor(profile),
        }), 201

    except ValidationError as error:
        return jsonify({
            "success": False,
            "errors": error.messages,
        }), 400

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 409


@vendors_bp.get("/vendors/profile")
@vendor_required
def get_vendor_profile(user):
    profile = VendorService.get_profile(user)

    if not profile:
        return jsonify({
            "success": False,
            "message": "Vendor profile not found.",
        }), 404

    return jsonify({
        "success": True,
        "data": serialize_vendor(profile),
    }), 200


@vendors_bp.patch("/vendors/profile")
@vendor_required
def update_vendor_profile(user):
    try:
        data = update_schema.load(request.get_json() or {})

        if not data:
            return jsonify({
                "success": False,
                "message": "Provide at least one field to update.",
            }), 400

        profile = VendorService.update_profile(user, data)

        return jsonify({
            "success": True,
            "message": "Vendor profile updated successfully.",
            "data": serialize_vendor(profile),
        }), 200

    except ValidationError as error:
        return jsonify({
            "success": False,
            "errors": error.messages,
        }), 400

    except LookupError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404


@vendors_bp.get("/admin/vendors")
@admin_required
def list_vendor_profiles(user):
    profiles = VendorService.list_profiles()

    return jsonify({
        "success": True,
        "count": len(profiles),
        "data": [
            serialize_vendor(profile)
            for profile in profiles
        ],
    }), 200


@vendors_bp.patch("/admin/vendors/<uuid:profile_id>/approval")
@admin_required
def update_vendor_approval(user, profile_id):
    try:
        payload = request.get_json() or {}
        is_approved = payload.get("is_approved")

        if not isinstance(is_approved, bool):
            return jsonify({
                "success": False,
                "message": "is_approved must be true or false.",
            }), 400

        profile = VendorService.set_approval(
            profile_id,
            is_approved,
        )

        return jsonify({
            "success": True,
            "message": (
                "Vendor approved successfully."
                if profile.is_approved
                else "Vendor approval revoked."
            ),
            "data": serialize_vendor(profile),
        }), 200

    except LookupError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404
