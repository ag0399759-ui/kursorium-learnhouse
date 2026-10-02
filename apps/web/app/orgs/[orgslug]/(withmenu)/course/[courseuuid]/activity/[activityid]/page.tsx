import { getActivityWithAuthHeader } from '@services/courses/activities'
import { getCourseMetadata } from '@services/courses/courses'
import ActivityClient from './activity'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getCourseThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { Metadata } from 'next'
import { getServerSession } from '@/lib/auth/server'
import { getOrgSeoConfig } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'

type MetadataProps = {
  params: Promise<{ orgslug: string; courseuuid: string; activityid: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
  const params = await props.params;
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token || null

  const [org, course_meta, activity] = await Promise.all([
    getOrganizationContextInfo(params.orgslug, {
      revalidate: 120,
      tags: ['organizations'],
    }),
    getCourseMetadata(params.courseuuid, { revalidate: 120, tags: ['courses'] }, access_token || null, { slim: true }),
    getActivityWithAuthHeader(
      params.activityid,
      { revalidate: 120, tags: ['activities'] },
      access_token || null
    ),
  ])

  // Check if this is the course end page
  const isCourseEnd = params.activityid === 'end';
  const seoConfig = getOrgSeoConfig(org)
  const rawTitle = isCourseEnd ? `Congratulations — ${course_meta.name} Course` : `${activity.name} — ${course_meta.name} Course`
  const pageTitle = seoConfig.default_meta_title_suffix ? `${rawTitle}${seoConfig.default_meta_title_suffix}` : rawTitle

  const orgOgImageUrl = seoConfig.default_og_image
    ? getOrgOgImageMediaDirectory(org?.org_uuid, seoConfig.default_og_image)
    : null
  const imageUrl = course_meta?.thumbnail_image
    ? getCourseThumbnailMediaDirectory(
        org?.org_uuid,
        course_meta?.course_uuid,
        course_meta?.thumbnail_image
      )
    : orgOgImageUrl || '/empty_thumbnail.png'
  const canonical = await getServerCanonicalUrl(params.orgslug, `/course/${params.courseuuid}/activity/${params.activityid}`)

  // SEO
  return {
    title: pageTitle,
    description: course_meta.description || seoConfig.default_meta_description || '',
    keywords: course_meta.learnings,
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title: pageTitle,
      description: course_meta.description || seoConfig.default_meta_description || '',
      publishedTime: course_meta.creation_date,
      tags: course_meta.learnings,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: course_meta.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: course_meta.description || seoConfig.default_meta_description || '',
      images: [imageUrl],
      ...(seoConfig.twitter_handle && { site: seoConfig.twitter_handle }),
    },
  }
}

// 2026 Premium Light Theme CSS — defined outside component to avoid re-creation
const THEME_CSS = [
  '@keyframes kurs-fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',
  /* ProseMirror light-theme typography */
  '.canva-content-wrapper .ProseMirror{padding:2.5rem 2.5rem;caret-color:#7c3aed;color:#111827;line-height:1.8;font-size:16.5px}',
  '.canva-content-wrapper .ProseMirror h1{font-size:32px;font-weight:800;margin-bottom:16px;margin-top:32px;color:#111827;letter-spacing:-.025em;line-height:1.25}',
  '.canva-content-wrapper .ProseMirror h2{font-size:24px;font-weight:700;margin-bottom:12px;margin-top:36px;color:#1f2937;position:relative;padding-bottom:10px}',
  '.canva-content-wrapper .ProseMirror h2::after{content:"";position:absolute;bottom:0;left:0;width:40px;height:3px;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:2px}',
  '.canva-content-wrapper .ProseMirror h3{font-size:20px;font-weight:600;margin-bottom:10px;margin-top:28px;color:#374151}',
  '.canva-content-wrapper .ProseMirror h4{font-size:16px;font-weight:600;margin-bottom:8px;margin-top:20px;color:#4b5563;text-transform:uppercase;letter-spacing:.04em}',
  '.canva-content-wrapper .ProseMirror p{margin-bottom:16px;color:#374151;line-height:1.8}',
  '.canva-content-wrapper .ProseMirror ul{list-style:none!important;padding:0!important;margin-bottom:20px;display:flex;flex-direction:column;gap:8px}',
  '.canva-content-wrapper .ProseMirror ul li{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;background:linear-gradient(135deg,rgba(124,58,237,.04) 0%,rgba(167,139,250,.04) 100%);border:1px solid rgba(124,58,237,.12);border-radius:10px;color:#374151;font-size:15px;line-height:1.6;transition:all .2s ease}',
  '.canva-content-wrapper .ProseMirror ul li::before{content:"•";color:#7c3aed;font-weight:700;margin-top:1px;flex-shrink:0}',
  '.canva-content-wrapper .ProseMirror ul li p{margin:0;color:#374151}',
  '.canva-content-wrapper .ProseMirror ul li:hover{background:rgba(124,58,237,.08);border-color:rgba(124,58,237,.25);transform:translateX(3px)}',
  '.canva-content-wrapper .ProseMirror ol{padding-left:1.5rem!important;margin-bottom:20px;display:flex;flex-direction:column;gap:6px}',
  '.canva-content-wrapper .ProseMirror ol li{color:#374151;font-size:15px;line-height:1.7;padding:4px 0}',
  '.canva-content-wrapper .ProseMirror ol li::marker{color:#7c3aed;font-weight:700}',
  '.canva-content-wrapper .ProseMirror strong,.canva-content-wrapper .ProseMirror b{color:#111827;font-weight:700}',
  '.canva-content-wrapper .ProseMirror em,.canva-content-wrapper .ProseMirror i{color:#4b5563;font-style:italic}',
  '.canva-content-wrapper .ProseMirror a{color:#7c3aed;text-decoration:none;border-bottom:1px solid rgba(124,58,237,.3);transition:all .2s ease;font-weight:500}',
  '.canva-content-wrapper .ProseMirror a:hover{color:#6d28d9;border-bottom-color:#7c3aed}',
  '.canva-content-wrapper .ProseMirror code{background:#f3f0ff;color:#7c3aed;font-size:.875em;padding:.2em .45em;border-radius:5px;font-family:"JetBrains Mono",monospace;border:1px solid rgba(124,58,237,.15)}',
  '.canva-content-wrapper .ProseMirror pre{background:#1e1b4b;color:#e2e8f0;padding:1.5rem;border-radius:12px;overflow-x:auto;margin-bottom:20px;border:1px solid rgba(124,58,237,.2)}',
  '.canva-content-wrapper .ProseMirror blockquote{border-left:4px solid #7c3aed;margin:20px 0;padding:16px 20px;background:linear-gradient(135deg,rgba(124,58,237,.05) 0%,transparent 100%);border-radius:0 10px 10px 0;color:#4b5563;font-style:italic}',
  '.canva-content-wrapper .ProseMirror hr{border:none;border-top:2px solid #f3f4f6;margin:32px 0;position:relative}',
  '.canva-content-wrapper .ProseMirror img{max-width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.08);margin:16px 0}',
  '.canva-content-wrapper .ProseMirror table{width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06)}',
  '.canva-content-wrapper .ProseMirror table th{background:#f9fafb;color:#111827;font-weight:600;text-align:left;padding:12px 16px;border-bottom:2px solid #e5e7eb;font-size:13px;text-transform:uppercase;letter-spacing:.03em}',
  '.canva-content-wrapper .ProseMirror table td{padding:11px 16px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14.5px}',
  '.canva-content-wrapper .ProseMirror table tr:hover td{background:#faf5ff}',
].join('')

const ActivityPage = async (params: any) => {
  const activityid = (await params.params).activityid
  const courseuuid = (await params.params).courseuuid
  const orgslug = (await params.params).orgslug

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <ActivityClient
        activityid={activityid}
        courseuuid={courseuuid}
        orgslug={orgslug}
        activity={null}
        course={null}
      />
    </>
  )
}

export default ActivityPage
