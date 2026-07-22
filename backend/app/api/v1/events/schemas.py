from marshmallow import Schema, fields, validate


class CreateEventSchema(Schema):
    title = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=255),
    )

    description = fields.Str(required=True)

    venue = fields.Str(required=True)

    city = fields.Str(required=True)

    country = fields.Str(required=True)

    category_id = fields.UUID(required=True)

    start_date = fields.DateTime(required=True)

    end_date = fields.DateTime(required=True)

    capacity = fields.Int(
        required=True,
        validate=validate.Range(min=1),
    )

    banner_image = fields.Str(load_default=None)

    latitude = fields.Float(load_default=None)

    longitude = fields.Float(load_default=None)
