from marshmallow import Schema, fields, validate


class CreateTicketTypeSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
    )

    description = fields.Str(
        load_default=None,
        allow_none=True,
    )

    price = fields.Decimal(
        required=True,
        places=2,
        as_string=True,
    )

    quantity = fields.Int(
        required=True,
        validate=validate.Range(min=1),
    )

    max_per_order = fields.Int(
        load_default=10,
        validate=validate.Range(min=1),
    )

    sales_start = fields.DateTime(
        load_default=None,
        allow_none=True,
    )

    sales_end = fields.DateTime(
        load_default=None,
        allow_none=True,
    )
