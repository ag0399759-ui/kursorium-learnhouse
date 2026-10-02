'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { getUriWithOrg } from '@services/config/config'
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  Layers,
  BookOpenCheck,
  Package,
  Puzzle,
  Globe,
  PlayCircle,
} from 'lucide-react'
import { MarkdownLogo } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface CourseActivitySidebarProps {
  course: any
  orgslug: string
  courseuuid: string
  currentActivityId: string
  trailData?: any
}

function getActivityIcon(activityType: string, activitySubType?: string) {
  if (activitySubType === 'SUBTYPE_DYNAMIC_MARKDOWN')
    return <MarkdownLogo size={13} className="text-violet-400" />
  if (activitySubType === 'SUBTYPE_DYNAMIC_EMBED')
    return <Globe size={13} className="text-violet-400" />
  switch (activityType) {
    case 'TYPE_VIDEO':
      return <Video size={13} className="text-violet-400" />
    case 'TYPE_DOCUMENT':
      return <FileText size={13} className="text-violet-400" />
    case 'TYPE_DYNAMIC':
      return <Layers size={13} className="text-violet-400" />
    case 'TYPE_ASSIGNMENT':
      return <BookOpenCheck size={13} className="text-violet-400" />
    case 'TYPE_SCORM':
      return <Package size={13} className="text-violet-400" />
    case 'TYPE_CUSTOM':
      return <Puzzle size={13} className="text-violet-400" />
    default:
      return <FileText size={13} className="text-violet-400" />
  }
}

export default function CourseActivitySidebar({
  course,
  orgslug,
  courseuuid,
  currentActivityId,
  trailData,
}: CourseActivitySidebarProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const cleanCourseUuid = courseuuid.replace('course_', '')
  const cleanCurrentId = currentActivityId.replace('activity_', '')

  // Auto-expand chapter containing the current activity
  const initialOpenChapters = useMemo(() => {
    const open: Record<number, boolean> = {}
    course.chapters.forEach((chapter: any, idx: number) => {
      const found = chapter.activities.find(
        (a: any) => a.activity_uuid?.replace('activity_', '') === cleanCurrentId
      )
      open[idx] = found ? true : idx === 0
    })
    return open
  }, [course.chapters, cleanCurrentId])

  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>(initialOpenChapters)

  const isActivityDone = useMemo(
    () => (activity: any) => {
      const run = trailData?.runs?.find((r: any) => {
        const clean = r.course?.course_uuid?.replace('course_', '')
        return clean === cleanCourseUuid
      })
      return run?.steps?.find(
        (step: any) => step.activity_id === activity.id && step.complete === true
      )
    },
    [trailData, cleanCourseUuid]
  )

  const allActivities = useMemo(
    () => course.chapters.flatMap((ch: any) => ch.activities),
    [course.chapters]
  )

  const currentIndex = useMemo(
    () =>
      allActivities.findIndex(
        (a: any) => a.activity_uuid?.replace('activity_', '') === cleanCurrentId
      ),
    [allActivities, cleanCurrentId]
  )

  const completedCount = useMemo(
    () => allActivities.filter((a: any) => isActivityDone(a)).length,
    [allActivities, isActivityDone]
  )
  const totalCount = allActivities.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const navigate = (direction: 'prev' | 'next') => {
    const target =
      direction === 'prev' ? allActivities[currentIndex - 1] : allActivities[currentIndex + 1]
    if (!target) return
    const id = target.activity_uuid?.replace('activity_', '')
    router.push(getUriWithOrg(orgslug, '') + `/course/${cleanCourseUuid}/activity/${id}`)
  }

  const toggleChapter = (idx: number) => {
    setOpenChapters((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: '#FAFAFA',
        borderLeft: '1px solid #E4E4E7',
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-4 pt-4 pb-3 shrink-0"
        style={{ borderBottom: '1px solid #E4E4E7', background: '#FFFFFF' }}
      >
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#71717A',
            marginBottom: '10px',
          }}
        >
          {t('courses.course_content')}
        </p>

        {/* Progress info */}
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>
            {completedCount}/{totalCount} {t('common.completed')}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED' }}>
            {progressPercent}%
          </span>
        </div>

        {/* Progress track */}
        <div
          style={{
            width: '100%',
            height: '5px',
            background: '#E4E4E7',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)',
              borderRadius: '3px',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* ── Chapter accordion (scrollable) ── */}
      <div
        className="flex-1 overflow-y-auto py-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4D4D8 transparent' }}
      >
        {course.chapters.map((chapter: any, chapterIdx: number) => {
          const isOpen = openChapters[chapterIdx]
          const chapterCompleted = chapter.activities.filter((a: any) => isActivityDone(a)).length
          const chapterTotal = chapter.activities.length
          const chapterDone = chapterCompleted === chapterTotal && chapterTotal > 0

          return (
            <div key={chapter.id} className="mb-0.5">
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapterIdx)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 group"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = '#F4F4F5'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Chapter number badge */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: chapterDone ? '#10B981' : '#EDE9FE',
                      color: chapterDone ? '#FFFFFF' : '#7C3AED',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {chapterDone ? <Check size={10} strokeWidth={3} /> : chapterIdx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#27272A',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {chapter.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span style={{ fontSize: '10px', color: '#71717A' }}>
                    {chapterCompleted}/{chapterTotal}
                  </span>
                  <ChevronDown
                    size={13}
                    style={{
                      color: '#71717A',
                      transition: 'transform 0.25s',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </button>

              {/* Activities list */}
              {isOpen && (
                <div className="pb-1">
                  {chapter.activities.map((activity: any) => {
                    const cleanId = activity.activity_uuid?.replace('activity_', '')
                    const isCurrent = cleanId === cleanCurrentId
                    const isDone = isActivityDone(activity)

                    return (
                      <Link
                        key={activity.id}
                        href={
                          getUriWithOrg(orgslug, '') +
                          `/course/${cleanCourseUuid}/activity/${cleanId}`
                        }
                        prefetch={false}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px 8px 20px',
                            margin: '1px 6px',
                            borderRadius: '8px',
                            transition: 'all 0.15s ease',
                            cursor: 'pointer',
                            background: isCurrent ? '#EDE9FE' : 'transparent',
                            borderLeft: isCurrent ? '3px solid #7C3AED' : '3px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrent)
                              (e.currentTarget as HTMLElement).style.background = '#F5F3FF'
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrent)
                              (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                        >
                          {/* Status dot */}
                          <div style={{ flexShrink: 0 }}>
                            {isDone ? (
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: '#10B981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Check size={10} color="#FFFFFF" strokeWidth={3} />
                              </div>
                            ) : isCurrent ? (
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: '#EDE9FE',
                                  border: '2px solid #7C3AED',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <PlayCircle size={10} color="#7C3AED" />
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: '1.5px solid #D4D4D8',
                                }}
                              />
                            )}
                          </div>

                          {/* Activity info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: '12px',
                                fontWeight: isCurrent ? 600 : 500,
                                color: isCurrent ? '#7C3AED' : isDone ? '#71717A' : '#52525B',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                margin: 0,
                                lineHeight: 1.4,
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {activity.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              {getActivityIcon(activity.activity_type, activity.activity_sub_type)}
                              <span style={{ fontSize: '10px', color: '#A1A1AA' }}>
                                {activity.activity_type === 'TYPE_VIDEO'
                                  ? t('activities.video')
                                  : activity.activity_type === 'TYPE_DOCUMENT'
                                  ? t('activities.document')
                                  : t('activities.interactive')}
                              </span>
                            </div>
                          </div>

                          {/* "Зараз" badge */}
                          {isCurrent && (
                            <div
                              style={{
                                flexShrink: 0,
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '999px',
                                background: '#7C3AED',
                                color: '#FFFFFF',
                                letterSpacing: '0.04em',
                              }}
                            >
                              ▶
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Prev / Next navigation ── */}
      <div
        className="px-3 py-3 shrink-0 flex gap-2"
        style={{ borderTop: '1px solid #E4E4E7', background: '#FFFFFF' }}
      >
        <button
          onClick={() => navigate('prev')}
          disabled={currentIndex <= 0}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex <= 0 ? 0.35 : 1,
            background: '#F4F4F5',
            color: '#52525B',
            border: '1px solid #E4E4E7',
            transition: 'all 0.15s',
          }}
        >
          <ChevronLeft size={13} />
          {t('activities.previous_activity')}
        </button>
        <button
          onClick={() => navigate('next')}
          disabled={currentIndex >= totalCount - 1}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: currentIndex >= totalCount - 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex >= totalCount - 1 ? 0.35 : 1,
            background: '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (currentIndex < totalCount - 1)
              (e.currentTarget as HTMLElement).style.background = '#6D28D9'
          }}
          onMouseLeave={(e) => {
            if (currentIndex < totalCount - 1)
              (e.currentTarget as HTMLElement).style.background = '#7C3AED'
          }}
        >
          {t('activities.next_activity')}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
