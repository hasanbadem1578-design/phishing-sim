import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

logger = logging.getLogger(__name__)


def build_personalized_body(html_body: str, user, tracking_base_url: str, campaign_id: int) -> str:
    tracking_link = f"{tracking_base_url}/track/click/{campaign_id}/{user.id}"
    landing_url = f"{tracking_base_url}/landing/{campaign_id}/{user.id}"

    return (
        html_body
        .replace("{{name}}", user.name)
        .replace("{{email}}", user.email)
        .replace("{{link}}", landing_url)
        .replace("{{tracking_link}}", tracking_link)
    )


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    smtp_host = current_app.config.get("SMTP_HOST", "localhost")
    smtp_port = current_app.config.get("SMTP_PORT", 1025)
    sender = current_app.config.get("MAIL_SENDER", "noreply@phishsim.local")

    # In memory-only mode just log the email (no real SMTP needed)
    if current_app.config.get("USE_MEMORY_MAIL", True):
        logger.info("=" * 60)
        logger.info("[MailService] Email logged (memory mode)")
        logger.info(f"  To:      {to_email}")
        logger.info(f"  Subject: {subject}")
        logger.info("=" * 60)
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.send_message(msg)

        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as exc:
        logger.error(f"Failed to send email to {to_email}: {exc}")
        return False
