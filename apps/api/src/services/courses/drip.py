"""Drip content: open lessons one day at a time after a student enrols.

A lesson with ``drip_day = N`` opens on the N-th calendar day after the
student's enrolment in *that* course, at ``unlock_hour`` local time in the
course's ``tz`` (default 06:00 Europe/Warsaw). Day 0 is open immediately.
Access is computed on every request, so there is no cron and nothing can be
"missed".

Pure functions only: no DB, no request objects.
Spec: kursorium-ecosystem/.scratch/drip-content/spec.md
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

DEFAULT_DRIP_TIMEZONE = "Europe/Warsaw"
DEFAULT_DRIP_UNLOCK_HOUR = 6

Moment = datetime | str


def _as_utc(moment: Moment) -> datetime:
    """Accept aware/naive datetimes and LearnHouse's ``str(datetime.now())``.

    Naive values are treated as UTC: the API container runs in UTC and
    TrailRun.creation_date is written with ``str(datetime.now())``.
    """
    if isinstance(moment, str):
        moment = datetime.fromisoformat(moment)
    if moment.tzinfo is None:
        return moment.replace(tzinfo=timezone.utc)
    return moment


def _local(moment: Moment, tz: str) -> datetime:
    return _as_utc(moment).astimezone(ZoneInfo(tz))


def _effective_date(now: Moment, tz: str, unlock_hour: int) -> date:
    local_now = _local(now, tz)
    if local_now.hour < unlock_hour:
        return local_now.date() - timedelta(days=1)
    return local_now.date()


def drip_day_index(
    enrolled_at: Moment,
    now: Moment,
    tz: str = DEFAULT_DRIP_TIMEZONE,
    unlock_hour: int = DEFAULT_DRIP_UNLOCK_HOUR,
) -> int:
    """Number of the drip day that is open for the student at ``now`` (>= 0)."""
    enroll_date = _local(enrolled_at, tz).date()
    return max((_effective_date(now, tz, unlock_hour) - enroll_date).days, 0)


def is_drip_unlocked(
    drip_day: int | None,
    enrolled_at: Moment,
    now: Moment,
    tz: str = DEFAULT_DRIP_TIMEZONE,
    unlock_hour: int = DEFAULT_DRIP_UNLOCK_HOUR,
) -> bool:
    """True if a lesson/chapter with ``drip_day`` is open. ``None`` = no drip."""
    if drip_day is None:
        return True
    return drip_day <= drip_day_index(enrolled_at, now, tz, unlock_hour)


def drip_unlocks_at(
    drip_day: int,
    enrolled_at: Moment,
    tz: str = DEFAULT_DRIP_TIMEZONE,
    unlock_hour: int = DEFAULT_DRIP_UNLOCK_HOUR,
) -> datetime:
    """UTC moment when ``drip_day`` opens: enrolment date + N days at ``unlock_hour`` local."""
    zone = ZoneInfo(tz)
    unlock_date = _local(enrolled_at, tz).date() + timedelta(days=drip_day)
    local_unlock = datetime(unlock_date.year, unlock_date.month, unlock_date.day, unlock_hour, tzinfo=zone)
    return local_unlock.astimezone(timezone.utc)
