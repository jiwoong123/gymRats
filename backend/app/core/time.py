from datetime import date, datetime, timezone


def utc_now() -> datetime:
    """Return naive UTC for Oracle DATE/TIMESTAMP columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def utc_today() -> date:
    return datetime.now(timezone.utc).date()
