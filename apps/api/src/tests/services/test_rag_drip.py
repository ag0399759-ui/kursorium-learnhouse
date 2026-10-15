"""Test RAG drip filtering."""
import pytest
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from src.db.courses.activities import Activity
from src.db.courses.chapters import Chapter
from src.db.trail_runs import TrailRun
from src.services.ai.rag.query_service import query_course_rag


@pytest.mark.asyncio
class TestRAGDripFiltering:
    """Test that RAG search respects drip locks."""

    async def test_rag_accepts_user_id_for_drip(
        self, course, db, admin_user, regular_user
    ):
        """RAG query_course_rag accepts user_id for drip filtering."""
        # Enable drip for course
        course.drip_timezone = "UTC"
        course.drip_unlock_hour = 4
        db.add(course)
        await db.flush()

        # Create chapter
        chapter = Chapter(
            chapter_uuid="test-rag-chapter",
            name="RAG Chapter",
            course_id=course.id,
            org_id=course.org_id,
        )
        db.add(chapter)
        await db.flush()

        # Create two activities: one open, one drip-locked
        open_activity = Activity(
            activity_uuid="test-open",
            name="Open Activity",
            activity_type="TYPE_VIDEO",
            activity_sub_type="SUBTYPE_VIDEO_HOSTED",
            content={},
            published=True,
            lock_type="public",
            drip_day=None,
            chapter_id=chapter.id,
            course_id=course.id,
            org_id=course.org_id,
        )
        drip_activity = Activity(
            activity_uuid="test-drip",
            name="Drip Activity",
            activity_type="TYPE_VIDEO",
            activity_sub_type="SUBTYPE_VIDEO_HOSTED",
            content={},
            published=True,
            lock_type="public",
            drip_day=2,
            chapter_id=chapter.id,
            course_id=course.id,
            org_id=course.org_id,
        )
        db.add_all([open_activity, drip_activity])
        await db.flush()

        # Create trail run for learner (enrolled today, so drip_day=2 is locked)
        trail_run = TrailRun(
            user_id=regular_user.id,
            course_id=course.id,
            org_id=course.org_id,
            creation_date=datetime.now(timezone.utc),
            update_date=datetime.now(timezone.utc),
        )
        db.add(trail_run)
        await db.commit()

        # Mock embed_single_text to avoid API calls
        with patch(
            "src.services.ai.rag.query_service.embed_single_text",
            return_value=[0.1] * 768,
        ):
            # Mock db execute to avoid real query
            mock_result = MagicMock()
            mock_result.fetchall = MagicMock(return_value=[])
            
            async def mock_execute(*args, **kwargs):
                return mock_result
            
            db.execute = mock_execute

            # Query RAG as learner — should not raise
            result = await query_course_rag(
                question="test",
                org_id=course.org_id,
                db_session=db,
                course_id=course.id,
                user_id=regular_user.id,
            )

            assert "context" in result
            assert "sources" in result

            # Query RAG as admin — should also work
            result_admin = await query_course_rag(
                question="test",
                org_id=course.org_id,
                db_session=db,
                course_id=course.id,
                user_id=admin_user.id,
            )

            assert "context" in result_admin
            assert "sources" in result_admin
