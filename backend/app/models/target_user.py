from .base import db
from .campaign import campaign_users


class TargetUser(db.Model):
    __tablename__ = "target_users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), nullable=False, unique=True)
    department = db.Column(db.String(80))

    campaigns = db.relationship("Campaign", secondary=campaign_users, back_populates="targets")
    events = db.relationship("TrackingEvent", back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "department": self.department,
        }
