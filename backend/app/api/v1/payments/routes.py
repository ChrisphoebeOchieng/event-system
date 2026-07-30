from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.v1.auth.decorators import current_user_required
from app.api.v1.payments.schemas import CreatePaymentSchema
from app.api.v1.payments.service import PaymentService

payments_bp = Blueprint("payments", __name__)

create_schema = CreatePaymentSchema()


def serialize_payment(payment):
    return {
        "id": str(payment.id),
        "booking_id": str(payment.booking_id),
        "amount": str(payment.amount),
        "method": payment.method.value,
        "status": payment.status.value,
        "transaction_reference": payment.transaction_reference,
        "phone_number": payment.phone_number,
        "paid_at": (
            payment.paid_at.isoformat()
            if payment.paid_at
            else None
        ),
        "created_at": payment.created_at.isoformat(),
    }


@payments_bp.post("/payments")
@current_user_required
def create_payment(user):
    try:
        data = create_schema.load(request.get_json() or {})
        payment = PaymentService.pay(user, data)

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Payment completed successfully.",
                    "data": serialize_payment(payment),
                }
            ),
            201,
        )

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

    except PermissionError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 403

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 409


@payments_bp.get("/payments/me")
@current_user_required
def get_my_payments(user):
    payments = PaymentService.list_for_user(user)

    return jsonify({
        "success": True,
        "count": len(payments),
        "data": [
            {
                **serialize_payment(payment),
                "booking_reference": (
                    payment.booking.booking_reference
                ),
                "event_id": str(payment.booking.event_id),
                "event_title": payment.booking.event.title,
                "event_image": payment.booking.event.banner_image,
                "ticket_name": payment.booking.ticket_type.name,
                "quantity": payment.booking.quantity,
                "booking_status": payment.booking.status.value,
            }
            for payment in payments
        ],
    }), 200
