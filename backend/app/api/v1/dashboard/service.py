from sqlalchemy import func

from app.database import db
from app.models.booking import Booking, BookingStatus
from app.models.event import Event, EventStatus
from app.models.payment import Payment, PaymentStatus
from app.models.refund import Refund, RefundStatus
from app.models.ticket_type import TicketType
from app.models.user import User, UserRole
from app.models.vendor_profile import VendorProfile


class DashboardService:
    @staticmethod
    def organizer_summary(user):
        event_ids_query = (
            db.session.query(Event.id)
            .filter(Event.organizer_id == user.id)
        )

        total_events = (
            db.session.query(func.count(Event.id))
            .filter(Event.organizer_id == user.id)
            .scalar()
            or 0
        )

        published_events = (
            db.session.query(func.count(Event.id))
            .filter(
                Event.organizer_id == user.id,
                Event.status == EventStatus.PUBLISHED,
            )
            .scalar()
            or 0
        )

        total_bookings = (
            db.session.query(func.count(Booking.id))
            .filter(Booking.event_id.in_(event_ids_query))
            .scalar()
            or 0
        )

        confirmed_bookings = (
            db.session.query(func.count(Booking.id))
            .filter(
                Booking.event_id.in_(event_ids_query),
                Booking.status == BookingStatus.CONFIRMED,
            )
            .scalar()
            or 0
        )

        tickets_sold = (
            db.session.query(
                func.coalesce(func.sum(Booking.quantity), 0)
            )
            .filter(
                Booking.event_id.in_(event_ids_query),
                Booking.status == BookingStatus.CONFIRMED,
            )
            .scalar()
            or 0
        )

        total_revenue = (
            db.session.query(
                func.coalesce(func.sum(Payment.amount), 0)
            )
            .join(Booking, Payment.booking_id == Booking.id)
            .filter(
                Booking.event_id.in_(event_ids_query),
                Payment.status == PaymentStatus.COMPLETED,
            )
            .scalar()
            or 0
        )

        refunded_amount = (
            db.session.query(
                func.coalesce(func.sum(Refund.amount), 0)
            )
            .join(Booking, Refund.booking_id == Booking.id)
            .filter(
                Booking.event_id.in_(event_ids_query),
                Refund.status == RefundStatus.COMPLETED,
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

        recent_bookings = (
            Booking.query
            .join(Event, Booking.event_id == Event.id)
            .filter(Event.organizer_id == user.id)
            .order_by(Booking.created_at.desc())
            .limit(8)
            .all()
        )

        organizer_events = (
            Event.query
            .filter(Event.organizer_id == user.id)
            .order_by(Event.created_at.desc())
            .limit(8)
            .all()
        )

        event_performance = []

        for event in organizer_events:
            event_bookings = (
                Booking.query
                .filter(
                    Booking.event_id == event.id,
                    Booking.status == BookingStatus.CONFIRMED,
                )
                .all()
            )

            sold = sum(
                booking.quantity
                for booking in event_bookings
            )

            revenue = (
                db.session.query(
                    func.coalesce(func.sum(Payment.amount), 0)
                )
                .join(
                    Booking,
                    Payment.booking_id == Booking.id,
                )
                .filter(
                    Booking.event_id == event.id,
                    Payment.status == PaymentStatus.COMPLETED,
                )
                .scalar()
                or 0
            )

            event_performance.append({
                "id": str(event.id),
                "title": event.title,
                "banner_image": event.banner_image,
                "status": event.status.value,
                "start_date": event.start_date.isoformat(),
                "capacity": event.capacity,
                "tickets_sold": int(sold),
                "tickets_remaining": event.tickets_remaining,
                "revenue": str(revenue),
            })

        return {
            "total_events": int(total_events),
            "published_events": int(published_events),
            "total_bookings": int(total_bookings),
            "confirmed_bookings": int(confirmed_bookings),
            "tickets_sold": int(tickets_sold),
            "total_revenue": str(total_revenue),
            "refunded_amount": str(refunded_amount),
            "active_ticket_types": int(active_ticket_types),
            "recent_bookings": [
                {
                    "id": str(booking.id),
                    "booking_reference": booking.booking_reference,
                    "event_title": booking.event.title,
                    "attendee": (
                        f"{booking.user.first_name} "
                        f"{booking.user.last_name}"
                    ),
                    "quantity": booking.quantity,
                    "total_amount": str(booking.total_amount),
                    "status": booking.status.value,
                    "payment_status": (
                        booking.payment.status.value
                        if booking.payment
                        else None
                    ),
                    "created_at": booking.created_at.isoformat(),
                }
                for booking in recent_bookings
            ],
            "event_performance": event_performance,
        }

    @staticmethod
    def admin_summary():
        total_users = (
            db.session.query(func.count(User.id))
            .filter(User.is_deleted.is_(False))
            .scalar()
            or 0
        )

        total_attendees = (
            db.session.query(func.count(User.id))
            .filter(
                User.role == UserRole.ATTENDEE,
                User.is_deleted.is_(False),
            )
            .scalar()
            or 0
        )

        total_organizers = (
            db.session.query(func.count(User.id))
            .filter(
                User.role == UserRole.ORGANIZER,
                User.is_deleted.is_(False),
            )
            .scalar()
            or 0
        )

        total_vendors = (
            db.session.query(func.count(User.id))
            .filter(
                User.role == UserRole.VENDOR,
                User.is_deleted.is_(False),
            )
            .scalar()
            or 0
        )

        total_events = (
            db.session.query(func.count(Event.id)).scalar()
            or 0
        )

        published_events = (
            db.session.query(func.count(Event.id))
            .filter(Event.status == EventStatus.PUBLISHED)
            .scalar()
            or 0
        )

        total_bookings = (
            db.session.query(func.count(Booking.id)).scalar()
            or 0
        )

        confirmed_bookings = (
            db.session.query(func.count(Booking.id))
            .filter(Booking.status == BookingStatus.CONFIRMED)
            .scalar()
            or 0
        )

        tickets_sold = (
            db.session.query(
                func.coalesce(func.sum(Booking.quantity), 0)
            )
            .filter(Booking.status == BookingStatus.CONFIRMED)
            .scalar()
            or 0
        )

        total_revenue = (
            db.session.query(
                func.coalesce(func.sum(Payment.amount), 0)
            )
            .filter(Payment.status == PaymentStatus.COMPLETED)
            .scalar()
            or 0
        )

        refunded_amount = (
            db.session.query(
                func.coalesce(func.sum(Refund.amount), 0)
            )
            .filter(Refund.status == RefundStatus.COMPLETED)
            .scalar()
            or 0
        )

        pending_refunds = (
            db.session.query(func.count(Refund.id))
            .filter(Refund.status == RefundStatus.PENDING)
            .scalar()
            or 0
        )

        pending_vendor_approvals = (
            db.session.query(func.count(VendorProfile.id))
            .filter(VendorProfile.is_approved.is_(False))
            .scalar()
            or 0
        )

        recent_bookings = (
            Booking.query
            .order_by(Booking.created_at.desc())
            .limit(6)
            .all()
        )

        recent_events = (
            Event.query
            .order_by(Event.created_at.desc())
            .limit(5)
            .all()
        )

        return {
            "total_users": int(total_users),
            "total_attendees": int(total_attendees),
            "total_organizers": int(total_organizers),
            "total_vendors": int(total_vendors),
            "total_events": int(total_events),
            "published_events": int(published_events),
            "total_bookings": int(total_bookings),
            "confirmed_bookings": int(confirmed_bookings),
            "tickets_sold": int(tickets_sold),
            "total_revenue": str(total_revenue),
            "refunded_amount": str(refunded_amount),
            "pending_refunds": int(pending_refunds),
            "pending_vendor_approvals": int(
                pending_vendor_approvals
            ),
            "recent_bookings": [
                {
                    "id": str(booking.id),
                    "reference": booking.booking_reference,
                    "event_title": booking.event.title,
                    "attendee": (
                        f"{booking.user.first_name} "
                        f"{booking.user.last_name}"
                    ),
                    "quantity": booking.quantity,
                    "amount": str(booking.total_amount),
                    "status": booking.status.value,
                    "created_at": booking.created_at.isoformat(),
                }
                for booking in recent_bookings
            ],
            "recent_events": [
                {
                    "id": str(event.id),
                    "title": event.title,
                    "organizer": (
                        f"{event.organizer.first_name} "
                        f"{event.organizer.last_name}"
                    ),
                    "status": event.status.value,
                    "tickets_remaining": event.tickets_remaining,
                    "capacity": event.capacity,
                    "start_date": event.start_date.isoformat(),
                }
                for event in recent_events
            ],
        }
