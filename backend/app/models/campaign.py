from datetime import datetime
from .base import db


campaign_users = db.Table(
    "campaign_users",
    db.Column("campaign_id", db.Integer, db.ForeignKey("campaigns.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("target_users.id"), primary_key=True),
)


class Campaign(db.Model):
    __tablename__ = "campaigns"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    template_id = db.Column(db.Integer, db.ForeignKey("templates.id"), nullable=False)
    status = db.Column(db.String(20), default="draft")  # draft | active | completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sent_at = db.Column(db.DateTime)

    template = db.relationship("Template", back_populates="campaigns")
    targets = db.relationship("TargetUser", secondary=campaign_users, back_populates="campaigns")
    events = db.relationship("TrackingEvent", back_populates="campaign", cascade="all, delete-orphan")

    def to_dict(self):
        clicked = sum(1 for e in self.events if e.event_type == "click")
        submitted = sum(1 for e in self.events if e.event_type == "submit")
        total = len(self.targets)
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "template_id": self.template_id,
            "template_name": self.template.name if self.template else None,
            "status": self.status,
            "target_count": total,
            "click_count": clicked,
            "submit_count": submitted,
            "click_rate": round(clicked / total * 100, 1) if total else 0,
            "submit_rate": round(submitted / total * 100, 1) if total else 0,
            "created_at": self.created_at.isoformat(),
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
        }
