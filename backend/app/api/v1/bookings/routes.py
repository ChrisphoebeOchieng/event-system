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
        "event_title": booking.event.title,
        "event_image": booking.event.banner_image,
        "event_date": booking.event.start_date.isoformat(),
        "event_end_date": booking.event.end_date.isoformat(),
        "event_venue": booking.event.venue,
        "event_city": booking.event.city,
        "event_country": booking.event.country,
        "ticket_type_id": str(booking.ticket_type_id),
        "ticket_name": booking.ticket_type.name,
        "quantity": booking.quantity,
        "unit_price": str(booking.unit_price),
        "total_amount": str(booking.total_amount),
        "status": booking.status.value,
        "payment_status": (
            booking.payment.status.value
            if booking.payment
            else None
        ),
        "refund": (
            {
                "id": str(booking.refund.id),
                "status": booking.refund.status.value,
            }
            if booking.refund
            else None
        ),
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
    bookings = sorted(
        user.bookings if hasattr(user, "bookings") else [],
        key=lambda booking: booking.created_at,
        reverse=True,
    )

    return jsonify({
        "success": True,
        "count": len(bookings),
        "data": [
            serialize_booking(booking)
            for booking in bookings
        ],
    }), 200
