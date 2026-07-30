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


@events_bp.get("/mine")
@current_user_required
def get_my_events(user):
    events = EventService.get_for_organizer(user)

    return jsonify({
        "success": True,
        "count": len(events),
        "data": [
            {
                "id": str(event.id),
                "title": event.title,
                "slug": event.slug,
                "banner_image": event.banner_image,
                "venue": event.venue,
                "city": event.city,
                "country": event.country,
                "start_date": event.start_date.isoformat(),
                "end_date": event.end_date.isoformat(),
                "capacity": event.capacity,
                "tickets_remaining": event.tickets_remaining,
                "featured": event.featured,
                "status": event.status.value,
                "created_at": event.created_at.isoformat(),
                "ticket_types_count": len(event.ticket_types),
            }
            for event in events
        ],
    }), 200


@events_bp.patch("/<uuid:event_id>/status")
@current_user_required
def update_event_status(user, event_id):
    from app.api.v1.events.schemas import UpdateEventStatusSchema

    schema = UpdateEventStatusSchema()

    try:
        data = schema.load(request.get_json() or {})

        event = EventService.update_status(
            event_id=event_id,
            user=user,
            status=data["status"],
        )

        return jsonify({
            "success": True,
            "message": f"Event status changed to {event.status.value}.",
            "data": {
                "id": str(event.id),
                "status": event.status.value,
            },
        }), 200

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
        }), 400


@events_bp.delete("/<uuid:event_id>")
@current_user_required
def delete_event(user, event_id):
    try:
        EventService.delete(event_id, user)

        return jsonify({
            "success": True,
            "message": "Event deleted successfully.",
        }), 200

    except LookupError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

@events_bp.patch("/<uuid:event_id>")
@current_user_required
def update_event(user, event_id):
    from app.api.v1.events.schemas import UpdateEventSchema

    schema = UpdateEventSchema()

    try:
        data = schema.load(request.get_json() or {})

        if not data:
            return jsonify({
                "success": False,
                "message": "Provide at least one field to update.",
            }), 400

        event = EventService.update(
            event_id=event_id,
            user=user,
            data=data,
        )

        return jsonify({
            "success": True,
            "message": "Event updated successfully.",
            "data": {
                "id": str(event.id),
                "title": event.title,
                "slug": event.slug,
                "description": event.description,
                "venue": event.venue,
                "city": event.city,
                "country": event.country,
                "category_id": str(event.category_id),
                "start_date": event.start_date.isoformat(),
                "end_date": event.end_date.isoformat(),
                "capacity": event.capacity,
                "tickets_remaining": event.tickets_remaining,
                "banner_image": event.banner_image,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "status": event.status.value,
            },
        }), 200

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
        }), 400

