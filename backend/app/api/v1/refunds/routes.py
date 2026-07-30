from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.v1.auth.decorators import admin_required, current_user_required
from app.api.v1.refunds.schemas import (
    CreateRefundSchema,
    ReviewRefundSchema,
)
from app.api.v1.refunds.service import RefundService

refunds_bp = Blueprint("refunds", __name__)

create_schema = CreateRefundSchema()
review_schema = ReviewRefundSchema()


def serialize_refund(refund):
    return {
        "id": str(refund.id),
        "booking_id": str(refund.booking_id),
        "payment_id": str(refund.payment_id),
        "user_id": str(refund.user_id),
        "reason": refund.reason,
        "amount": str(refund.amount),
        "status": refund.status.value,
        "admin_note": refund.admin_note,
        "requested_at": refund.requested_at.isoformat(),
        "processed_at": (
            refund.processed_at.isoformat()
            if refund.processed_at
            else None
        ),
        "booking": {
            "reference": refund.booking.booking_reference,
            "quantity": refund.booking.quantity,
            "event_title": refund.booking.event.title,
            "ticket_name": refund.booking.ticket_type.name,
        },
    }


@refunds_bp.post("/refunds")
@current_user_required
def create_refund(user):
    try:
        data = create_schema.load(request.get_json() or {})
        refund = RefundService.create(user, data)

        return jsonify({
            "success": True,
            "message": "Refund request submitted successfully.",
            "data": serialize_refund(refund),
        }), 201

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

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 409


@refunds_bp.get("/refunds/me")
@current_user_required
def list_my_refunds(user):
    refunds = RefundService.list_for_user(user)

    return jsonify({
        "success": True,
        "count": len(refunds),
        "data": [
            serialize_refund(refund)
            for refund in refunds
        ],
    }), 200


@refunds_bp.get("/admin/refunds")
@admin_required
def list_all_refunds(user):
    refunds = RefundService.list_all()

    return jsonify({
        "success": True,
        "count": len(refunds),
        "data": [
            serialize_refund(refund)
            for refund in refunds
        ],
    }), 200


@refunds_bp.patch("/admin/refunds/<uuid:refund_id>")
@admin_required
def review_refund(user, refund_id):
    try:
        data = review_schema.load(request.get_json() or {})
        refund = RefundService.review(refund_id, data)

        return jsonify({
            "success": True,
            "message": f"Refund marked as {refund.status.value}.",
            "data": serialize_refund(refund),
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

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 409
