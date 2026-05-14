import logging
from datetime import datetime
from flask import current_app
from ..models.base import db
from ..models.campaign import Campaign
from ..models.tracking import TrackingEvent
from .email_service import build_personalized_body, send_email

logger = logging.getLogger(__name__)


def run_campaign(campaign: Campaign) -> dict:
    if campaign.status == "completed":
        return {"error": "Campaign already completed"}

    base_url = current_app.config.get("BASE_URL", "http://localhost:5000")
    sent, failed = 0, 0

    for user in campaign.targets:
        html = build_personalized_body(
            campaign.template.html_body, user, base_url, campaign.id
        )
        ok = send_email(user.email, campaign.template.subject, html)
        if ok:
            sent += 1
        else:
            failed += 1

    campaign.status = "active"
    campaign.sent_at = datetime.utcnow()
    db.session.commit()

    logger.info(f"Campaign {campaign.id} sent: {sent} ok, {failed} failed")
    return {"sent": sent, "failed": failed}


def record_event(campaign_id: int, user_id: int, event_type: str, request) -> TrackingEvent:
    event = TrackingEvent(
        campaign_id=campaign_id,
        user_id=user_id,
        event_type=event_type,
        ip_address=request.remote_addr,
        user_agent=request.headers.get("User-Agent", "")[:300],
    )
    db.session.add(event)
    db.session.commit()
    return event
