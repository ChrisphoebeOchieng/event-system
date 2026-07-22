from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.v1.auth.decorators import current_user_required
from app.api.v1.bookings.schemas import CreateBookingSchema
from app.api.v1.bookings.service import BookingService

bookings_bp = Blueprint("bookings", __name__)

create_schema = CreateBookingSchema()


def serialize_booking(booking):
    return {
        "id": str(booking.id),
        "booking_reference": booking.booking_reference,
        "event_id": str(booking.event_id),
        "ticket_type_id": str(booking.ticket_type_id),
        "quantity": booking.quantity,
        "unit_price": str(booking.unit_price),
        "total_amount": str(booking.total_amount),
        "status": booking.status.value,
        "created_at": booking.created_at.isoformat(),
    }


@bookings_bp.post("/events/<uuid:event_id>/bookings")
@current_user_required
def create_booking(user, event_id):
    try:
        data = create_schema.load(request.get_json() or {})
        booking = BookingService.create(user, event_id, data)

        return jsonify({
            "success": True,
            "message": "Booking created successfully.",
            "data": serialize_booking(booking),
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


@bookings_bp.get("/bookings/me")
@current_user_required
def get_my_bookings(user):
    bookings = (
        user.bookings
        if hasattr(user, "bookings")
        else []
    )

    return jsonify({
        "success": True,
        "count": len(bookings),
        "data": [
            serialize_booking(booking)
            for booking in bookings
        ],
    }), 200
