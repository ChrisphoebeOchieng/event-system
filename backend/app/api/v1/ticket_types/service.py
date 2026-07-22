from decimal import Decimal

from app.database import db
from app.models.event import Event
from app.models.ticket_type import TicketType


class TicketTypeService:
    @staticmethod
    def get_owned_event(event_id, user):
        event = db.session.get(Event, event_id)

        if not event:
            raise LookupError("Event not found.")

        if str(event.organizer_id) != str(user.id):
            raise PermissionError(
                "You are not authorized to manage this event."
            )

        return event

    @staticmethod
    def create(event_id, data, user):
        event = TicketTypeService.get_owned_event(event_id, user)

        existing = TicketType.query.filter_by(
            event_id=event.id,
            name=data["name"].strip(),
        ).first()

        if existing:
            raise ValueError(
                "A ticket type with this name already exists."
            )

        ticket_type = TicketType(
            event_id=event.id,
            name=data["name"].strip(),
            description=data.get("description"),
            price=Decimal(str(data["price"])),
            quantity=data["quantity"],
            max_per_order=data["max_per_order"],
            sales_start=data.get("sales_start"),
            sales_end=data.get("sales_end"),
        )

        db.session.add(ticket_type)
        db.session.commit()

        return ticket_type

    @staticmethod
    def list_for_event(event_id):
        event = db.session.get(Event, event_id)

        if not event:
            raise LookupError("Event not found.")

        return (
            TicketType.query
            .filter_by(event_id=event.id)
            .order_by(TicketType.price.asc())
            .all()
        )
