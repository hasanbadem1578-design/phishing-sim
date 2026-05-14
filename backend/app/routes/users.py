import csv
import io
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


@bp.post("/import-csv")
def import_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    content = file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))

    added, skipped = 0, 0
    for row in reader:
        name = (row.get("name") or row.get("ad") or "").strip()
        email = (row.get("email") or row.get("eposta") or "").strip()
        dept = (row.get("department") or row.get("departman") or "").strip() or None

        if not name or not email:
            skipped += 1
            continue
        if TargetUser.query.filter_by(email=email).first():
            skipped += 1
            continue

        db.session.add(TargetUser(name=name, email=email, department=dept))
        added += 1

    db.session.commit()
    return jsonify({"added": added, "skipped": skipped})


@bp.delete("/<int:uid>")
def delete_user(uid):
    u = TargetUser.query.get_or_404(uid)
    db.session.delete(u)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
