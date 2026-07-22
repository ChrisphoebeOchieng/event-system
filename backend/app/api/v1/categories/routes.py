from flask import Blueprint, jsonify

from app.models.category import Category

categories_bp = Blueprint("categories", __name__)


@categories_bp.get("/categories")
def list_categories():
    categories = Category.query.order_by(Category.name.asc()).all()

    return (
        jsonify(
            {
                "success": True,
                "count": len(categories),
                "data": [
                    {
                        "id": str(category.id),
                        "name": category.name,
                        "slug": category.slug,
                        "description": category.description,
                        "icon": category.icon,
                    }
                    for category in categories
                ],
            }
        ),
        200,
    )
