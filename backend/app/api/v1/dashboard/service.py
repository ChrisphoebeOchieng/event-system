from sqlalchemy import func

from app.database import db
from app.models.booking import Booking, BookingStatus
from app.models.event import Event
from app.models.payment import Payment, PaymentStatus
from app.models.ticket_type import TicketType


class DashboardService:
    @staticmethod
    def organizer_summary(user):
        event_ids = (
            db.session.query(Event.id)
            .filter(Event.organizer_id == user.id)
            .subquery()
        )

        total_events = (
            db.session.query(func.count(Event.id))
            .filter(Event.organizer_id == user.id)
            .scalar()
            or 0
        )

        total_bookings = (
            db.session.query(func.count(Booking.id))
            .filter(Booking.event_id.in_(event_ids))
            .scalar()
            or 0
        )

        tickets_sold = (
            db.session.query(func.coalesce(func.sum(Booking.quantity), 0))
            .filter(
                Booking.event_id.in_(event_ids),
                Booking.status == BookingStatus.CONFIRMED,
            )
            .scalar()
            or 0
        )

        total_revenue = (
            db.session.query(func.coalesce(func.sum(Payment.amount), 0))
            .join(Booking, Payment.booking_id == Booking.id)
            .filter(
                Booking.event_id.in_(event_ids),
                Payment.status == PaymentStatus.COMPLETED,
            )
            .scalar()
            or 0
        )

        active_ticket_types = (
            db.session.query(func.count(TicketType.id))
            .join(Event, TicketType.event_id == Event.id)
            .filter(
                Event.organizer_id == user.id,
                TicketType.is_active.is_(True),
            )
            .scalar()
            or 0
        )

        return {
            "total_events": int(total_events),
            "total_bookings": int(total_bookings),
            "tickets_sold": int(tickets_sold),
            "total_revenue": str(total_revenue),
            "active_ticket_types": int(active_ticket_types),
        }
