from flask import Blueprint, request, jsonify
from ..models.base import db
from ..models.template import Template

bp = Blueprint("templates", __name__, url_prefix="/api/templates")


@bp.get("/")
def list_templates():
    templates = Template.query.order_by(Template.created_at.desc()).all()
    return jsonify([t.to_dict() for t in templates])


@bp.post("/")
def create_template():
    data = request.get_json()
    required = ["name", "subject", "html_body"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "name, subject and html_body are required"}), 400

    t = Template(
        name=data["name"],
        subject=data["subject"],
        category=data.get("category", "general"),
        html_body=data["html_body"],
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201


@bp.get("/<int:tid>")
def get_template(tid):
    t = Template.query.get_or_404(tid)
    return jsonify(t.to_dict())


@bp.put("/<int:tid>")
def update_template(tid):
    t = Template.query.get_or_404(tid)
    data = request.get_json()
    for field in ("name", "subject", "category", "html_body"):
        if field in data:
            setattr(t, field, data[field])
    db.session.commit()
    return jsonify(t.to_dict())


@bp.delete("/<int:tid>")
def delete_template(tid):
    t = Template.query.get_or_404(tid)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
