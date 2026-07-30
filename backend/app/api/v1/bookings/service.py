import random
import string
from decimal import Decimal

from app.database import db
from app.models.booking import Booking
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.notification import NotificationType
from app.api.v1.notifications.service import NotificationService


class BookingService:

    @staticmethod
    def generate_reference():
        return "EMS-" + "".join(
            random.choices(
                string.ascii_uppercase + string.digits,
                k=8,
            )
        )

    @staticmethod
    def create(user, event_id, data):

        event = db.session.get(Event, event_id)

        if not event:
            raise LookupError("Event not found.")

        ticket = db.session.get(
            TicketType,
            data["ticket_type_id"],
        )

        if not ticket:
            raise LookupError("Ticket type not found.")

        if ticket.event_id != event.id:
            raise ValueError(
                "Ticket type does not belong to this event."
            )

        if ticket.available_quantity < data["quantity"]:
            raise ValueError(
                "Not enough tickets available."
            )

        total = Decimal(ticket.price) * data["quantity"]

        booking = Booking(
            booking_reference=BookingService.generate_reference(),
            user_id=user.id,
            event_id=event.id,
            ticket_type_id=ticket.id,
            quantity=data["quantity"],
            unit_price=ticket.price,
            total_amount=total,
        )

        ticket.sold_quantity += data["quantity"]

        db.session.add(booking)
        db.session.flush()

        NotificationService.create(
            user_id=user.id,
            title="Booking created",
            message=(
                f"Your booking {booking.booking_reference} for "
                f"{event.title} was created. Complete payment to "
                "confirm your tickets."
            ),
            notification_type=NotificationType.BOOKING,
            event_id=event.id,
            booking_id=booking.id,
        )

        db.session.commit()

        return booking
