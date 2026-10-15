"""
Tests for drip-content enforcement in content_files router.
"""
import pytest
from datetime import datetime, timezone
from fastapi import HTTPException
from src.db.users import AnonymousUser, PublicUser
from src.db.courses.courses import Course
from src.db.courses.activities import Activity
from src.db.trail_runs import TrailRun
from src.routers.content_files import _check_content_access


@pytest.mark.asyncio
async def test_activity_content_blocked_by_drip(db, org, regular_user):
    """Activity content returns 403 when drip-locked."""
    # Створюю курс
    course = Course(
        course_uuid="course-drip-test",
        name="Drip Course",
        org_id=org.id,
        public=False,
        drip_timezone="UTC",
        drip_unlock_hour=6,
        open_to_contributors=False,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)

    # Створюю урок з drip_day=5
    activity = Activity(
        activity_uuid="act-locked",
        name="Locked Lesson",
        course_id=course.id,
        org_id=org.id,
        drip_day=5,
        activity_type="TYPE_DYNAMIC",
        activity_sub_type="SUBTYPE_DYNAMIC_PAGE",
        content={"body": "locked"},
    )
    db.add(activity)
    await db.commit()

    # Створюю студентку, записану сьогодні (день 0)
    now = datetime.now(timezone.utc)
    trail = TrailRun(
        user_id=regular_user.id,
        course_id=course.id,
        creation_date=now,
        update_date=now,
    )
    db.add(trail)
    await db.commit()

    # Запит на медіа закритого уроку → 403
    file_path = f"orgs/{org.org_uuid}/courses/{course.course_uuid}/activities/{activity.activity_uuid}/video.mp4"

    with pytest.raises(HTTPException) as exc:
        await _check_content_access(file_path, regular_user, db)
    
    assert exc.value.status_code == 403
    assert "drip" in exc.value.detail.lower() or "unlock" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_activity_content_allowed_when_unlocked(db, org, admin_user):
    """Activity content succeeds when drip-unlocked."""
    course = Course(
        course_uuid="course-drip-open",
        name="Drip Course",
        org_id=org.id,
        public=False,
        drip_timezone="UTC",
        drip_unlock_hour=6,
        open_to_contributors=False,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)

    # Урок з drip_day=0 (відкритий одразу)
    activity = Activity(
        activity_uuid="act-open",
        name="Open Lesson",
        course_id=course.id,
        org_id=org.id,
        drip_day=0,
        activity_type="TYPE_DYNAMIC",
        activity_sub_type="SUBTYPE_DYNAMIC_PAGE",
        content={"body": "open"},
    )
    db.add(activity)
    await db.commit()

    now = datetime.now(timezone.utc)
    trail = TrailRun(
        user_id=admin_user.id,
        course_id=course.id,
        creation_date=now,
        update_date=now,
    )
    db.add(trail)
    await db.commit()

    file_path = f"orgs/{org.org_uuid}/courses/{course.course_uuid}/activities/{activity.activity_uuid}/video.mp4"

    # Не має викидати виняток
    await _check_content_access(file_path, admin_user, db)
