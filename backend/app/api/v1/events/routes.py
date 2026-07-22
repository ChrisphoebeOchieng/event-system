from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.v1.auth.decorators import current_user_required
from app.api.v1.events.schemas import CreateEventSchema
from app.api.v1.events.service import EventService

events_bp = Blueprint("events", __name__)

create_schema = CreateEventSchema()


@events_bp.post("/")
@current_user_required
def create_event(user):
    try:
        data = create_schema.load(request.get_json())
        event = EventService.create(data, user)

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Event created successfully.",
                    "data": {
                        "id": str(event.id),
                        "title": event.title,
                        "slug": event.slug,
                    },
                }
            ),
            201,
        )

    except ValidationError as error:
        return (
            jsonify(
                {
                    "success": False,
                    "errors": error.messages,
                }
            ),
            400,
        )

    except ValueError as error:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(error),
                }
            ),
            400,
        )


@events_bp.get("/")
def get_events():
    events = EventService.get_all()

    return (
        jsonify(
            {
                "success": True,
                "count": len(events),
                "data": [
                    {
                        "id": str(event.id),
                        "title": event.title,
                        "slug": event.slug,
                        "venue": event.venue,
                        "city": event.city,
                        "country": event.country,
                        "start_date": event.start_date.isoformat(),
                        "banner_image": event.banner_image,
                        "featured": event.featured,
                        "status": event.status.value,
                    }
                    for event in events
                ],
            }
        ),
        200,
    )


@events_bp.get("/<uuid:event_id>")
def get_event(event_id):
    event = EventService.get_by_id(event_id)

    if not event:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Event not found.",
                }
            ),
            404,
        )

    return (
        jsonify(
            {
                "success": True,
                "data": {
                    "id": str(event.id),
                    "title": event.title,
                    "slug": event.slug,
                    "description": event.description,
                    "venue": event.venue,
                    "city": event.city,
                    "country": event.country,
                    "capacity": event.capacity,
                    "tickets_remaining": event.tickets_remaining,
                    "start_date": event.start_date.isoformat(),
                    "end_date": event.end_date.isoformat(),
                    "featured": event.featured,
                    "status": event.status.value,
                },
            }
        ),
        200,
    )
