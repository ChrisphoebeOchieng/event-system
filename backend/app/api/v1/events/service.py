from slugify import slugify

from app.database import db
from app.models.event import Event


class EventService:

    @staticmethod
    def create(data, organizer):

        slug = slugify(data["title"])

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
        return Event.query.filter_by(
            id=event_id
        ).first()

    @staticmethod
    def get_for_organizer(user):
        return (
            Event.query
            .filter_by(organizer_id=user.id)
            .order_by(Event.created_at.desc())
            .all()
        )
