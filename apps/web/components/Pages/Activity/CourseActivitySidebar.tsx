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
    return <MarkdownLogo size={13} className="text-slate-400" />
  if (activitySubType === 'SUBTYPE_DYNAMIC_EMBED')
    return <Globe size={13} className="text-slate-400" />
  switch (activityType) {
    case 'TYPE_VIDEO':
      return <Video size={13} className="text-slate-400" />
    case 'TYPE_DOCUMENT':
      return <FileText size={13} className="text-slate-400" />
    case 'TYPE_DYNAMIC':
      return <Layers size={13} className="text-slate-400" />
    case 'TYPE_ASSIGNMENT':
      return <BookOpenCheck size={13} className="text-slate-400" />
    case 'TYPE_SCORM':
      return <Package size={13} className="text-slate-400" />
    case 'TYPE_CUSTOM':
      return <Puzzle size={13} className="text-slate-400" />
    default:
      return <FileText size={13} className="text-slate-400" />
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

  // Find the current chapter index to auto-expand it
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

  // Check if an activity is done
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

  // Flatten all activities for navigation
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

  // Progress
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
        background: 'linear-gradient(180deg, #0f1117 0%, #141720 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
          {t('courses.course_content')}
        </p>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-400 font-medium">
            {completedCount}/{totalCount} {t('common.completed')}
          </span>
          <span
            className="text-[11px] font-bold"
            style={{ color: '#3ecfcf' }}
          >
            {progressPercent}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '5px', background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #3ecfcf 0%, #6c8efb 100%)',
            }}
          />
        </div>
      </div>

      {/* Chapter accordion - scrollable */}
      <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {course.chapters.map((chapter: any, chapterIdx: number) => {
          const isOpen = openChapters[chapterIdx]
          const chapterCompleted = chapter.activities.filter((a: any) => isActivityDone(a)).length
          const chapterTotal = chapter.activities.length

          return (
            <div key={chapter.id} className="mb-0.5">
              {/* Chapter header button */}
              <button
                onClick={() => toggleChapter(chapterIdx)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.04] group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="flex items-center justify-center rounded-full shrink-0 text-[10px] font-bold"
                    style={{
                      width: '20px',
                      height: '20px',
                      background:
                        chapterCompleted === chapterTotal && chapterTotal > 0
                          ? 'linear-gradient(135deg, #3ecfcf, #6c8efb)'
                          : 'rgba(255,255,255,0.1)',
                      color:
                        chapterCompleted === chapterTotal && chapterTotal > 0
                          ? '#fff'
                          : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {chapterIdx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">
                    {chapter.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500">
                    {chapterCompleted}/{chapterTotal}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                          className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg transition-all duration-150 cursor-pointer group/item ${
                            isCurrent ? '' : 'hover:bg-white/[0.04]'
                          }`}
                          style={
                            isCurrent
                              ? {
                                  background:
                                    'linear-gradient(90deg, rgba(108,142,251,0.18) 0%, rgba(62,207,207,0.10) 100%)',
                                  border: '1px solid rgba(108,142,251,0.25)',
                                }
                              : {}
                          }
                        >
                          {/* Status icon */}
                          <div className="shrink-0">
                            {isDone ? (
                              <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  background: 'linear-gradient(135deg, #3ecfcf, #6c8efb)',
                                }}
                              >
                                <Check size={10} className="text-white stroke-[3]" />
                              </div>
                            ) : isCurrent ? (
                              <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  border: '2px solid rgba(108,142,251,0.6)',
                                }}
                              >
                                <PlayCircle size={10} style={{ color: '#6c8efb' }} />
                              </div>
                            ) : (
                              <div
                                className="rounded-full"
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  border: '1.5px solid rgba(255,255,255,0.12)',
                                }}
                              />
                            )}
                          </div>

                          {/* Activity info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[12px] font-medium leading-tight truncate transition-colors ${
                                isCurrent
                                  ? 'text-white'
                                  : isDone
                                  ? 'text-slate-500'
                                  : 'text-slate-400 group-hover/item:text-slate-200'
                              }`}
                            >
                              {activity.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {getActivityIcon(activity.activity_type, activity.activity_sub_type)}
                              <span className="text-[10px] text-slate-600">
                                {activity.activity_type === 'TYPE_VIDEO'
                                  ? t('activities.video')
                                  : activity.activity_type === 'TYPE_DOCUMENT'
                                  ? t('activities.document')
                                  : t('activities.interactive')}
                              </span>
                            </div>
                          </div>

                          {/* Current badge */}
                          {isCurrent && (
                            <div
                              className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: 'linear-gradient(90deg, #6c8efb, #3ecfcf)',
                                color: '#fff',
                              }}
                            >
                              NOW
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

      {/* Prev / Next navigation */}
      <div
        className="px-3 py-3 shrink-0 flex gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => navigate('prev')}
          disabled={currentIndex <= 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <ChevronLeft size={13} />
          {t('activities.previous_activity')}
        </button>
        <button
          onClick={() => navigate('next')}
          disabled={currentIndex >= totalCount - 1}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, rgba(108,142,251,0.25), rgba(62,207,207,0.15))',
            color: '#fff',
            border: '1px solid rgba(108,142,251,0.3)',
          }}
        >
          {t('activities.next_activity')}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
