from marshmallow import Schema, fields, validate


class CreateBookingSchema(Schema):
    ticket_type_id = fields.UUID(required=True)

    quantity = fields.Int(
        required=True,
        validate=validate.Range(min=1, max=10),
    )
