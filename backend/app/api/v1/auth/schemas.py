from marshmallow import Schema, ValidationError, fields, validate, validates


class RegisterSchema(Schema):
    first_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
    )

    last_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
    )

    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=50),
    )

    email = fields.Email(required=True)

    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=8),
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        if not any(char.isupper() for char in value):
            raise ValidationError(
                "Password must contain at least one uppercase letter."
            )

        if not any(char.isdigit() for char in value):
            raise ValidationError(
                "Password must contain at least one number."
            )


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)
