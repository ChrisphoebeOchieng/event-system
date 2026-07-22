from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.api.v1.auth.decorators import current_user_required
from app.api.v1.auth.schemas import LoginSchema, RegisterSchema
from app.api.v1.auth.service import AuthService
from app.models.user import User

auth_bp = Blueprint("auth", __name__)

register_schema = RegisterSchema()
login_schema = LoginSchema()


@auth_bp.post("/register")
def register():
    try:
        data = register_schema.load(request.get_json())
        user = AuthService.register(data)

        return jsonify({
            "success": True,
            "message": "Account created successfully.",
            "data": {
                "id": str(user.id),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
            },
        }), 201

    except ValidationError as err:
        return jsonify({
            "success": False,
            "errors": err.messages,
        }), 400

    except ValueError as err:
        return jsonify({
            "success": False,
            "message": str(err),
        }), 409


@auth_bp.post("/login")
def login():
    try:
        data = login_schema.load(request.get_json())
        result = AuthService.login(data)

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "data": {
                "access_token": result["access_token"],
                "refresh_token": result["refresh_token"],
                "user": {
                    "id": str(result["user"].id),
                    "first_name": result["user"].first_name,
                    "last_name": result["user"].last_name,
                    "email": result["user"].email,
                    "role": result["user"].role.value,
                },
            },
        }), 200

    except ValidationError as err:
        return jsonify({
            "success": False,
            "errors": err.messages,
        }), 400

    except ValueError as err:
        return jsonify({
            "success": False,
            "message": str(err),
        }), 401


@auth_bp.get("/me")
@current_user_required
def me(user):
    return jsonify({
        "success": True,
        "data": {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "status": user.status.value,
        },
    }), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():

    identity = get_jwt_identity()

    access_token = create_access_token(identity=identity)

    return jsonify({
        "success": True,
        "access_token": access_token,
    }), 200
