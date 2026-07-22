from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.v1.auth.decorators import current_user_required
from app.api.v1.ticket_types.schemas import CreateTicketTypeSchema
from app.api.v1.ticket_types.service import TicketTypeService

ticket_types_bp = Blueprint("ticket_types", __name__)

create_schema = CreateTicketTypeSchema()


def serialize_ticket_type(ticket_type):
    return {
        "id": str(ticket_type.id),
        "event_id": str(ticket_type.event_id),
        "name": ticket_type.name,
        "description": ticket_type.description,
        "price": str(ticket_type.price),
        "quantity": ticket_type.quantity,
        "sold_quantity": ticket_type.sold_quantity,
        "available_quantity": ticket_type.available_quantity,
        "max_per_order": ticket_type.max_per_order,
        "sales_start": (
            ticket_type.sales_start.isoformat()
            if ticket_type.sales_start
            else None
        ),
        "sales_end": (
            ticket_type.sales_end.isoformat()
            if ticket_type.sales_end
            else None
        ),
        "is_active": ticket_type.is_active,
    }


@ticket_types_bp.post("/events/<uuid:event_id>/ticket-types")
@current_user_required
def create_ticket_type(user, event_id):
    try:
        data = create_schema.load(request.get_json() or {})
        ticket_type = TicketTypeService.create(event_id, data, user)

        return jsonify({
            "success": True,
            "message": "Ticket type created successfully.",
            "data": serialize_ticket_type(ticket_type),
        }), 201

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

    except PermissionError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 403

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 409


@ticket_types_bp.get("/events/<uuid:event_id>/ticket-types")
def list_ticket_types(event_id):
    try:
        ticket_types = TicketTypeService.list_for_event(event_id)

        return jsonify({
            "success": True,
            "count": len(ticket_types),
            "data": [
                serialize_ticket_type(ticket_type)
                for ticket_type in ticket_types
            ],
        }), 200

    except LookupError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404
