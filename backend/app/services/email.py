import os
import smtplib
from email.message import EmailMessage

from app.core.config import FRONTEND_URL


def send_reset_email(address: str, name: str, token: str) -> bool:
    host = os.getenv("SMTP_HOST")
    if not host:
        return False
    message = EmailMessage()
    message["Subject"] = "Reset your Chronicle password"
    message["From"] = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "no-reply@chronicle.local"))
    message["To"] = address
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    message.set_content(f"Hello {name},\n\nUse this link to choose a new Chronicle password. It expires in 30 minutes.\n\n{link}\n\nIf you did not request this, you can ignore this email.")
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587")), timeout=15) as smtp:
        smtp.starttls()
        if os.getenv("SMTP_USER"):
            smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
        smtp.send_message(message)
    return True
