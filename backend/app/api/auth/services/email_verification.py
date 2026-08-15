from datetime import timedelta
from email.message import EmailMessage
import hashlib
import hmac
import secrets
import smtplib

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.time import utc_now
from app.db.repositories.userRepository import UserRepository
from app.models.email_verification import EmailVerification


CODE_TTL_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 60
MAX_ATTEMPTS = 5


class EmailVerificationError(ValueError):
    pass


class EmailAlreadyRegisteredError(EmailVerificationError):
    pass


class EmailVerificationRateLimitError(EmailVerificationError):
    pass


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _hash_secret(value: str) -> str:
    return hmac.new(
        settings.JWT_SECRET_KEY.encode(),
        value.encode(),
        hashlib.sha256,
    ).hexdigest()


def _send_code(email: str, code: str) -> None:
    if settings.EMAIL_DELIVERY_MODE == "console":
        print(f"[development email] {email}: verification code {code}")
        return
    if settings.EMAIL_DELIVERY_MODE != "smtp":
        raise RuntimeError("Unsupported email delivery mode")
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        raise RuntimeError("Email delivery is not configured")

    message = EmailMessage()
    message["Subject"] = "GymRats 이메일 인증 코드"
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = email
    message.set_content(
        f"GymRats 회원가입 인증 코드는 {code}입니다. "
        f"인증 코드는 {CODE_TTL_MINUTES}분 동안 유효합니다."
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as client:
        if settings.SMTP_USE_TLS:
            client.starttls()
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            client.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        client.send_message(message)


def request_verification(db: Session, email: str) -> int:
    normalized = _normalize_email(email)
    if UserRepository.get_user_by_email(db, normalized):
        raise EmailAlreadyRegisteredError("이미 가입된 이메일입니다.")

    now = utc_now()
    latest = (
        db.query(EmailVerification)
        .filter(EmailVerification.email == normalized)
        .order_by(EmailVerification.created_at.desc())
        .first()
    )
    if latest and (now - latest.created_at).total_seconds() < RESEND_COOLDOWN_SECONDS:
        raise EmailVerificationRateLimitError("인증 코드는 60초 후 다시 요청할 수 있습니다.")

    code = f"{secrets.randbelow(1_000_000):06d}"
    challenge = EmailVerification(
        email=normalized,
        code_hashed=_hash_secret(code),
        verification_token_hashed=None,
        expires_at=now + timedelta(minutes=CODE_TTL_MINUTES),
        verified_at=None,
        consumed_at=None,
        attempts=0,
    )
    db.add(challenge)
    db.flush()
    try:
        _send_code(normalized, code)
    except Exception:
        db.delete(challenge)
        db.flush()
        raise
    return challenge.id


def verify_code(db: Session, challenge_id: int, email: str, code: str) -> str:
    normalized = _normalize_email(email)
    challenge = (
        db.query(EmailVerification)
        .filter(EmailVerification.id == challenge_id)
        .with_for_update()
        .first()
    )
    now = utc_now()
    if (
        challenge is None
        or challenge.email != normalized
        or challenge.consumed_at is not None
        or challenge.verified_at is not None
        or challenge.expires_at <= now
        or challenge.attempts >= MAX_ATTEMPTS
    ):
        raise EmailVerificationError("인증 요청이 만료되었거나 유효하지 않습니다.")

    challenge.attempts += 1
    if not hmac.compare_digest(challenge.code_hashed, _hash_secret(code)):
        db.commit()
        raise EmailVerificationError("인증 코드가 올바르지 않습니다.")

    token = secrets.token_urlsafe(32)
    challenge.verification_token_hashed = _hash_secret(token)
    challenge.verified_at = now
    db.flush()
    return token


def consume_verification(db: Session, email: str, token: str) -> None:
    normalized = _normalize_email(email)
    token_hashed = _hash_secret(token)
    challenge = (
        db.query(EmailVerification)
        .filter(
            EmailVerification.email == normalized,
            EmailVerification.verification_token_hashed == token_hashed,
        )
        .with_for_update()
        .first()
    )
    now = utc_now()
    if (
        challenge is None
        or challenge.verified_at is None
        or challenge.consumed_at is not None
        or challenge.expires_at <= now
    ):
        raise EmailVerificationError("이메일 인증이 필요합니다.")
    challenge.consumed_at = now
    db.flush()
