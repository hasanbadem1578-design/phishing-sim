from datetime import datetime
from .base import db


class TrackingEvent(db.Model):
    __tablename__ = "tracking_events"

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaigns.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("target_users.id"), nullable=False)
    event_type = db.Column(db.String(20), nullable=False)  # click | submit | open
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    campaign = db.relationship("Campaign", back_populates="events")
    user = db.relationship("TargetUser", back_populates="events")

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "user_email": self.user.email if self.user else None,
            "event_type": self.event_type,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat(),
        }
