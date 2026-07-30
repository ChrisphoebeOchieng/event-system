from slugify import slugify

from app.database import db
from app.models.event import Event, EventStatus


class EventService:

    @staticmethod
    def create(data, organizer):
        base_slug = slugify(data["title"])
        slug = base_slug
        counter = 1

        while Event.query.filter_by(slug=slug).first():
            counter += 1
            slug = f"{base_slug}-{counter}"

        event = Event(
            title=data["title"],
            slug=slug,
            description=data["description"],
            venue=data["venue"],
            city=data["city"],
            country=data["country"],
            start_date=data["start_date"],
            end_date=data["end_date"],
            capacity=data["capacity"],
            tickets_remaining=data["capacity"],
            banner_image=data.get("banner_image"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            organizer_id=organizer.id,
            category_id=data["category_id"],
        )

        db.session.add(event)
        db.session.commit()

        return event

    @staticmethod
    def get_all():
        return (
            Event.query
            .order_by(Event.start_date.asc())
            .all()
        )

    @staticmethod
    def get_by_id(event_id):
        return Event.query.filter_by(id=event_id).first()

    @staticmethod
    def get_for_organizer(user):
        return (
            Event.query
            .filter_by(organizer_id=user.id)
            .order_by(Event.created_at.desc())
            .all()
        )

    @staticmethod
    def get_owned_event(event_id, user):
        return Event.query.filter_by(
            id=event_id,
            organizer_id=user.id,
        ).first()

    @staticmethod
    def update_status(event_id, user, status):
        event = EventService.get_owned_event(event_id, user)

        if not event:
            raise LookupError(
                "Event not found or you do not have permission to manage it."
            )

        if status == "published" and len(event.ticket_types) == 0:
            raise ValueError(
                "Add at least one ticket type before publishing this event."
            )

        event.status = EventStatus(status)
        db.session.commit()

        return event

    @staticmethod
    def update(event_id, user, data):
        event = EventService.get_owned_event(event_id, user)

        if not event:
            raise LookupError(
                "Event not found or you do not have permission to edit it."
            )

        if event.status == EventStatus.COMPLETED:
            raise ValueError("A completed event cannot be edited.")

        new_start_date = data.get("start_date", event.start_date)
        new_end_date = data.get("end_date", event.end_date)

        if new_end_date <= new_start_date:
            raise ValueError("The end date must be after the start date.")

        if "capacity" in data:
            tickets_sold = event.capacity - event.tickets_remaining

            if data["capacity"] < tickets_sold:
                raise ValueError(
                    f"Capacity cannot be lower than the {tickets_sold} "
                    "tickets already booked."
                )

            event.tickets_remaining = data["capacity"] - tickets_sold

        if "title" in data and data["title"] != event.title:
            base_slug = slugify(data["title"])
            slug = base_slug
            counter = 1

            while Event.query.filter(
                Event.slug == slug,
                Event.id != event.id,
            ).first():
                counter += 1
                slug = f"{base_slug}-{counter}"

            event.slug = slug

        editable_fields = [
            "title",
            "description",
            "venue",
            "city",
            "country",
            "category_id",
            "start_date",
            "end_date",
            "capacity",
            "banner_image",
            "latitude",
            "longitude",
        ]

        for field in editable_fields:
            if field in data:
                setattr(event, field, data[field])

        db.session.commit()

        return event

    @staticmethod
    def delete(event_id, user):
        event = EventService.get_owned_event(event_id, user)

        if not event:
            raise LookupError(
                "Event not found or you do not have permission to delete it."
            )

        if event.tickets_remaining < event.capacity:
            raise ValueError(
                "This event already has bookings and cannot be deleted. "
                "Cancel it instead."
            )

        db.session.delete(event)
        db.session.commit()
