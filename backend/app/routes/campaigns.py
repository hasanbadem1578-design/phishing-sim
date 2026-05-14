from flask import Blueprint, request, jsonify
from ..models.base import db
from ..models.campaign import Campaign
from ..models.target_user import TargetUser
from ..services.campaign_service import run_campaign

bp = Blueprint("campaigns", __name__, url_prefix="/api/campaigns")


@bp.get("/")
def list_campaigns():
    campaigns = Campaign.query.order_by(Campaign.created_at.desc()).all()
    return jsonify([c.to_dict() for c in campaigns])


@bp.post("/")
def create_campaign():
    data = request.get_json()
    if not data.get("name") or not data.get("template_id"):
        return jsonify({"error": "name and template_id are required"}), 400

    c = Campaign(
        name=data["name"],
        description=data.get("description"),
        template_id=data["template_id"],
    )

    user_ids = data.get("user_ids", [])
    if user_ids:
        c.targets = TargetUser.query.filter(TargetUser.id.in_(user_ids)).all()

    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201


@bp.get("/<int:cid>")
def get_campaign(cid):
    c = Campaign.query.get_or_404(cid)
    return jsonify(c.to_dict())


@bp.post("/<int:cid>/start")
def start_campaign(cid):
    c = Campaign.query.get_or_404(cid)
    if not c.targets:
        return jsonify({"error": "No targets assigned to this campaign"}), 400
    result = run_campaign(c)
    if "error" in result:
        return jsonify(result), 400
    return jsonify({"message": "Campaign started", **result})


@bp.delete("/<int:cid>")
def delete_campaign(cid):
    c = Campaign.query.get_or_404(cid)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
