from marshmallow import Schema, fields, validate


class CreateRefundSchema(Schema):
    booking_id = fields.UUID(required=True)

    reason = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=1000),
    )


class ReviewRefundSchema(Schema):
    status = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["approved", "rejected", "completed"]
        ),
    )

    admin_note = fields.Str(
        allow_none=True,
        load_default=None,
        validate=validate.Length(max=1000),
    )
