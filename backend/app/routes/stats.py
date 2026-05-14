from collections import defaultdict
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


@bp.get("/departments")
def department_stats():
    """Click/submit rates broken down by department."""
    campaigns = Campaign.query.filter(Campaign.status != "draft").all()

    dept_data: dict = defaultdict(lambda: {"sent": 0, "clicked": set(), "submitted": set()})

    for campaign in campaigns:
        events_by_user: dict = defaultdict(set)
        for e in campaign.events:
            events_by_user[e.user_id].add(e.event_type)

        for user in campaign.targets:
            dept = user.department or "Belirtilmemiş"
            dept_data[dept]["sent"] += 1
            if "click" in events_by_user.get(user.id, set()):
                dept_data[dept]["clicked"].add((campaign.id, user.id))
            if "submit" in events_by_user.get(user.id, set()):
                dept_data[dept]["submitted"].add((campaign.id, user.id))

    result = []
    for dept, data in dept_data.items():
        sent = data["sent"]
        clicked = len(data["clicked"])
        submitted = len(data["submitted"])
        result.append({
            "department": dept,
            "sent": sent,
            "click_count": clicked,
            "submit_count": submitted,
            "click_rate": round(clicked / sent * 100, 1) if sent else 0,
            "submit_rate": round(submitted / sent * 100, 1) if sent else 0,
        })

    result.sort(key=lambda x: x["submit_rate"], reverse=True)
    return jsonify(result)


@bp.get("/campaigns-overview")
def campaigns_overview():
    """All campaigns with their rates — for charts."""
    campaigns = Campaign.query.filter(Campaign.status != "draft").order_by(Campaign.sent_at).all()
    return jsonify([
        {
            "name": c.name,
            "target_count": len(c.targets),
            "click_rate": c.to_dict()["click_rate"],
            "submit_rate": c.to_dict()["submit_rate"],
            "sent_at": c.sent_at.isoformat() if c.sent_at else None,
        }
        for c in campaigns
    ])
