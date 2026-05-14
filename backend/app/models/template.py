from datetime import datetime
from .base import db


class Template(db.Model):
    __tablename__ = "templates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False, default="general")
    html_body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    campaigns = db.relationship("Campaign", back_populates="template")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subject": self.subject,
            "category": self.category,
            "html_body": self.html_body,
            "created_at": self.created_at.isoformat(),
        }
