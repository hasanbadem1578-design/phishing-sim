from flask import Blueprint, jsonify
from ..models.campaign import Campaign
from ..models.target_user import TargetUser
from ..models.template import Template
from ..models.tracking import TrackingEvent

bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@bp.get("/")
def global_stats():
    total_campaigns = Campaign.query.count()
    active_campaigns = Campaign.query.filter_by(status="active").count()
    total_users = TargetUser.query.count()
    total_templates = Template.query.count()

    total_clicks = TrackingEvent.query.filter_by(event_type="click").count()
    total_submits = TrackingEvent.query.filter_by(event_type="submit").count()
    total_sent = sum(
        len(c.targets) for c in Campaign.query.filter(Campaign.status != "draft").all()
    )

    return jsonify({
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_users": total_users,
        "total_templates": total_templates,
        "total_sent": total_sent,
        "total_clicks": total_clicks,
        "total_submits": total_submits,
        "click_rate": round(total_clicks / total_sent * 100, 1) if total_sent else 0,
        "submit_rate": round(total_submits / total_sent * 100, 1) if total_sent else 0,
    })


@bp.get("/campaigns/<int:cid>")
def campaign_stats(cid):
    campaign = Campaign.query.get_or_404(cid)
    events = campaign.events

    users_clicked = {e.user_id for e in events if e.event_type == "click"}
    users_submitted = {e.user_id for e in events if e.event_type == "submit"}
    total = len(campaign.targets)

    safe = [u for u in campaign.targets if u.id not in users_clicked]
    risky = [u for u in campaign.targets if u.id in users_clicked and u.id not in users_submitted]
    high_risk = [u for u in campaign.targets if u.id in users_submitted]

    return jsonify({
        "campaign_id": cid,
        "campaign_name": campaign.name,
        "total_targets": total,
        "click_count": len(users_clicked),
        "submit_count": len(users_submitted),
        "click_rate": round(len(users_clicked) / total * 100, 1) if total else 0,
        "submit_rate": round(len(users_submitted) / total * 100, 1) if total else 0,
        "safe_users": [u.to_dict() for u in safe],
        "risky_users": [u.to_dict() for u in risky],
        "high_risk_users": [u.to_dict() for u in high_risk],
        "events": [e.to_dict() for e in events],
    })
