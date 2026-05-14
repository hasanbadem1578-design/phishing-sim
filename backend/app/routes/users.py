from flask import Blueprint, request, jsonify
from ..models.base import db
from ..models.target_user import TargetUser

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.get("/")
def list_users():
    users = TargetUser.query.order_by(TargetUser.name).all()
    return jsonify([u.to_dict() for u in users])


@bp.post("/")
def create_user():
    data = request.get_json()
    if not data.get("name") or not data.get("email"):
        return jsonify({"error": "name and email are required"}), 400

    if TargetUser.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 409

    u = TargetUser(
        name=data["name"],
        email=data["email"],
        department=data.get("department"),
    )
    db.session.add(u)
    db.session.commit()
    return jsonify(u.to_dict()), 201


@bp.delete("/<int:uid>")
def delete_user(uid):
    u = TargetUser.query.get_or_404(uid)
    db.session.delete(u)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
