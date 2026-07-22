from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models.user import User


def current_user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):

        verify_jwt_in_request()

        user = User.query.get(get_jwt_identity())

        if not user:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "User not found.",
                    }
                ),
                404,
            )

        return fn(user, *args, **kwargs)

    return wrapper
