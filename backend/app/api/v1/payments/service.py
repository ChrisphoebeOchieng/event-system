import random
import string
from datetime import datetime, timezone

from app.database import db
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.notification import NotificationType
from app.api.v1.notifications.service import NotificationService


class PaymentService:

    @staticmethod
    def list_for_user(user):
        return (
            Payment.query
            .filter_by(user_id=user.id)
            .order_by(Payment.created_at.desc())
            .all()
        )

    @staticmethod
    def generate_reference():
        return "PAY-" + "".join(
            random.choices(
                string.ascii_uppercase + string.digits,
                k=10,
            )
        )

    @staticmethod
    def pay(user, data):

        booking = db.session.get(
            Booking,
            data["booking_id"],
        )

        if not booking:
            raise LookupError("Booking not found.")

        if str(booking.user_id) != str(user.id):
            raise PermissionError(
                "You are not allowed to pay for this booking."
            )

        existing = Payment.query.filter_by(
            booking_id=booking.id,
        ).first()

        if existing:
            raise ValueError(
                "This booking has already been paid."
            )

        payment = Payment(
            booking_id=booking.id,
            user_id=user.id,
            amount=booking.total_amount,
            method=PaymentMethod.MPESA,
            status=PaymentStatus.COMPLETED,
            transaction_reference=PaymentService.generate_reference(),
            phone_number=data["phone_number"],
            paid_at=datetime.now(timezone.utc),
        )

        booking.status = BookingStatus.CONFIRMED

        db.session.add(payment)
        db.session.flush()

        NotificationService.create(
            user_id=user.id,
            title="Payment confirmed",
            message=(
                f"Payment for booking {booking.booking_reference} "
                f"was completed successfully. Your tickets for "
                f"{booking.event.title} are now confirmed."
            ),
            notification_type=NotificationType.PAYMENT,
            event_id=booking.event_id,
            booking_id=booking.id,
        )

        db.session.commit()

        return payment
