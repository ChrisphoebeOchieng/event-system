from marshmallow import Schema, fields, validate


class CreatePaymentSchema(Schema):
    booking_id = fields.UUID(required=True)

    phone_number = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=15),
    )

    method = fields.Str(
        required=True,
        validate=validate.OneOf(["mpesa"]),
    )
