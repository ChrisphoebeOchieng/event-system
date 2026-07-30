from datetime import datetime, timezone

from app.database import db
from app.models.booking import Booking, BookingStatus
from app.models.payment import PaymentStatus
from app.models.refund import Refund, RefundStatus
from app.models.notification import NotificationType
from app.api.v1.notifications.service import NotificationService


class RefundService:

    @staticmethod
    def get_by_id(refund_id):
        return Refund.query.filter_by(id=refund_id).first()

    @staticmethod
    def list_for_user(user):
        return (
            Refund.query
            .filter_by(user_id=user.id)
            .order_by(Refund.requested_at.desc())
            .all()
        )

    @staticmethod
    def list_all():
        return (
            Refund.query
            .order_by(Refund.requested_at.desc())
            .all()
        )

    @staticmethod
    def create(user, data):
        booking = Booking.query.filter_by(
            id=data["booking_id"],
            user_id=user.id,
        ).first()

        if not booking:
            raise LookupError("Booking not found.")

        if booking.status != BookingStatus.CONFIRMED:
            raise ValueError(
                "Only confirmed bookings can be refunded."
            )

        if booking.refund:
            raise ValueError(
                "A refund request already exists for this booking."
            )

        payment = booking.payment

        if not payment:
            raise ValueError(
                "No payment was found for this booking."
            )

        if payment.status != PaymentStatus.COMPLETED:
            raise ValueError(
                "Only completed payments can be refunded."
            )

        refund = Refund(
            booking_id=booking.id,
            payment_id=payment.id,
            user_id=user.id,
            reason=data["reason"].strip(),
            amount=payment.amount,
        )

        db.session.add(refund)
        db.session.flush()

        NotificationService.create(
            user_id=user.id,
            title="Refund request received",
            message=(
                f"Your refund request for booking "
                f"{booking.booking_reference} has been submitted "
                "and is awaiting administrator review."
            ),
            notification_type=NotificationType.REFUND,
            event_id=booking.event_id,
            booking_id=booking.id,
            refund_id=refund.id,
        )

        db.session.commit()

        return refund

    @staticmethod
    def review(refund_id, data):
        refund = RefundService.get_by_id(refund_id)

        if not refund:
            raise LookupError("Refund request not found.")

        requested_status = RefundStatus(data["status"])

        if refund.status == RefundStatus.COMPLETED:
            raise ValueError(
                "A completed refund cannot be changed."
            )

        if requested_status == RefundStatus.COMPLETED:
            if refund.status != RefundStatus.APPROVED:
                raise ValueError(
                    "A refund must be approved before completion."
                )

            refund.payment.status = PaymentStatus.REFUNDED
            refund.booking.status = BookingStatus.CANCELLED

            refund.booking.ticket_type.sold_quantity = max(
                0,
                refund.booking.ticket_type.sold_quantity
                - refund.booking.quantity,
            )

            refund.booking.event.tickets_remaining += (
                refund.booking.quantity
            )

            refund.processed_at = datetime.now(timezone.utc)

        elif requested_status in {
            RefundStatus.APPROVED,
            RefundStatus.REJECTED,
        }:
            if refund.status != RefundStatus.PENDING:
                raise ValueError(
                    "Only pending refunds can be approved or rejected."
                )

            refund.processed_at = datetime.now(timezone.utc)

        refund.status = requested_status
        refund.admin_note = (
            data.get("admin_note", "").strip()
            if data.get("admin_note")
            else None
        )

        status_messages = {
            RefundStatus.APPROVED: (
                "Refund approved",
                (
                    f"Your refund request for booking "
                    f"{refund.booking.booking_reference} was approved."
                ),
            ),
            RefundStatus.REJECTED: (
                "Refund rejected",
                (
                    f"Your refund request for booking "
                    f"{refund.booking.booking_reference} was rejected."
                ),
            ),
            RefundStatus.COMPLETED: (
                "Refund completed",
                (
                    f"Your refund for booking "
                    f"{refund.booking.booking_reference} has been "
                    "completed."
                ),
            ),
        }

        title, message = status_messages[requested_status]

        NotificationService.create(
            user_id=refund.user_id,
            title=title,
            message=message,
            notification_type=NotificationType.REFUND,
            event_id=refund.booking.event_id,
            booking_id=refund.booking_id,
            refund_id=refund.id,
        )

        db.session.commit()

        return refund
