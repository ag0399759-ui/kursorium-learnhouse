"""Drip content rule: which lesson day is open for a student right now.

Spec: kursorium-ecosystem/.scratch/drip-content/spec.md (ticket 01).
Expected values below are worked by hand from the spec, not recomputed by the code.
"""

from datetime import datetime, timezone

from src.services.courses.drip import drip_day_index, drip_unlocks_at, is_drip_unlocked

UTC = timezone.utc


def utc(*args) -> datetime:
    return datetime(*args, tzinfo=UTC)


class TestDripDayIndex:
    def test_enrolment_day_is_day_zero(self):
        # Enrolled 10:00 Warsaw (08:00 UTC, CEST), checked 20:00 Warsaw same day.
        assert drip_day_index(utc(2026, 9, 10, 8, 0), utc(2026, 9, 10, 18, 0)) == 0

    def test_next_morning_after_six_warsaw_is_day_one(self):
        # 06:00 Warsaw on 11 Sep (CEST, UTC+2) == 04:00 UTC.
        assert drip_day_index(utc(2026, 9, 10, 8, 0), utc(2026, 9, 11, 4, 0)) == 1

    def test_next_morning_before_six_warsaw_is_still_day_zero(self):
        # 05:59 Warsaw on 11 Sep == 03:59 UTC.
        assert drip_day_index(utc(2026, 9, 10, 8, 0), utc(2026, 9, 11, 3, 59)) == 0

    def test_late_night_enrolment_gets_lesson_one_next_morning(self):
        # Enrolled 23:30 Warsaw 10 Sep (21:30 UTC); 06:00 Warsaw 11 Sep == 04:00 UTC.
        assert drip_day_index(utc(2026, 9, 10, 21, 30), utc(2026, 9, 11, 4, 0)) == 1

    def test_early_morning_enrolment_does_not_skip_a_day(self):
        # Enrolled 03:00 Warsaw 10 Sep (01:00 UTC); at 07:00 Warsaw same day still day 0.
        assert drip_day_index(utc(2026, 9, 10, 1, 0), utc(2026, 9, 10, 5, 0)) == 0

    def test_counts_calendar_days_not_24h_blocks(self):
        # Enrolled 22:00 Warsaw 10 Sep; three mornings later (13 Sep 06:00 = 04:00 UTC) is day 3,
        # although only ~54 hours have passed.
        assert drip_day_index(utc(2026, 9, 10, 20, 0), utc(2026, 9, 13, 4, 0)) == 3

    def test_autumn_clock_change(self):
        # 25 Oct 2026 Warsaw goes CEST -> CET (UTC+1). 06:00 Warsaw == 05:00 UTC.
        enrolled = utc(2026, 10, 24, 10, 0)
        assert drip_day_index(enrolled, utc(2026, 10, 25, 4, 59)) == 0
        assert drip_day_index(enrolled, utc(2026, 10, 25, 5, 0)) == 1

    def test_spring_clock_change(self):
        # 29 Mar 2026 Warsaw goes CET -> CEST (UTC+2). 06:00 Warsaw == 04:00 UTC.
        enrolled = utc(2026, 3, 28, 11, 0)
        assert drip_day_index(enrolled, utc(2026, 3, 29, 3, 59)) == 0
        assert drip_day_index(enrolled, utc(2026, 3, 29, 4, 0)) == 1

    def test_accepts_trailrun_string_dates_as_utc(self):
        # TrailRun.creation_date is stored as str(datetime.now()) on a UTC server.
        assert drip_day_index("2026-09-10 21:30:00.123456", utc(2026, 9, 11, 4, 0)) == 1


class TestIsDripUnlocked:
    def test_lesson_without_drip_day_is_always_open(self):
        assert is_drip_unlocked(None, utc(2026, 9, 10, 8, 0), utc(2026, 9, 10, 8, 0)) is True

    def test_lesson_zero_is_open_right_after_enrolment(self):
        assert is_drip_unlocked(0, utc(2026, 9, 10, 8, 0), utc(2026, 9, 10, 8, 1)) is True

    def test_lesson_two_opens_on_the_second_morning(self):
        enrolled = utc(2026, 9, 10, 8, 0)
        assert is_drip_unlocked(2, enrolled, utc(2026, 9, 11, 4, 0)) is False
        assert is_drip_unlocked(2, enrolled, utc(2026, 9, 12, 4, 0)) is True

    def test_custom_timezone_and_hour(self):
        # Kyiv (UTC+3 in Sep), unlock 08:00 -> 05:00 UTC.
        enrolled = utc(2026, 9, 10, 8, 0)
        assert is_drip_unlocked(1, enrolled, utc(2026, 9, 11, 4, 59), tz="Europe/Kyiv", unlock_hour=8) is False
        assert is_drip_unlocked(1, enrolled, utc(2026, 9, 11, 5, 0), tz="Europe/Kyiv", unlock_hour=8) is True


class TestDripUnlocksAt:
    def test_returns_utc_moment_of_the_unlock_morning(self):
        # Lesson 3, enrolled 10 Sep -> 13 Sep 06:00 Warsaw (CEST) == 04:00 UTC.
        assert drip_unlocks_at(3, utc(2026, 9, 10, 20, 0)) == utc(2026, 9, 13, 4, 0)

    def test_unlock_moment_across_clock_change(self):
        # Lesson 2, enrolled 24 Oct -> 26 Oct 06:00 Warsaw (CET) == 05:00 UTC.
        assert drip_unlocks_at(2, utc(2026, 10, 24, 10, 0)) == utc(2026, 10, 26, 5, 0)

    def test_lesson_zero_unlocks_at_enrolment_day(self):
        # Day 0 morning may be before enrolment; callers treat it as open (see is_drip_unlocked).
        assert drip_unlocks_at(0, utc(2026, 9, 10, 8, 0)) == utc(2026, 9, 10, 4, 0)
