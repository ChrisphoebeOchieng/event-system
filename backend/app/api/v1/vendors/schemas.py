from marshmallow import Schema, fields, validate


class VendorProfileSchema(Schema):
    business_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255),
    )

    business_type = fields.Str(
        required=True,
        validate=validate.OneOf(
            [
                "food",
                "drinks",
                "catering",
                "desserts",
                "merchandise",
                "other",
            ]
        ),
    )

    description = fields.Str(
        allow_none=True,
        load_default=None,
    )

    phone = fields.Str(
        required=True,
        validate=validate.Length(min=7, max=30),
    )

    city = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
    )

    country = fields.Str(
        load_default="Kenya",
        validate=validate.Length(min=2, max=100),
    )

    logo_url = fields.Str(
        allow_none=True,
        load_default=None,
    )


class UpdateVendorProfileSchema(Schema):
    business_name = fields.Str(
        validate=validate.Length(min=2, max=255),
    )

    business_type = fields.Str(
        validate=validate.OneOf(
            [
                "food",
                "drinks",
                "catering",
                "desserts",
                "merchandise",
                "other",
            ]
        ),
    )

    description = fields.Str(allow_none=True)

    phone = fields.Str(
        validate=validate.Length(min=7, max=30),
    )

    city = fields.Str(
        validate=validate.Length(min=2, max=100),
    )

    country = fields.Str(
        validate=validate.Length(min=2, max=100),
    )

    logo_url = fields.Str(allow_none=True)
