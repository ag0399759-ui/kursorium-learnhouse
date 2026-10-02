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

const ActivityPage = async (params: any) => {
const THEME_2026_CSS = `
  @keyframes kurs-fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .k26 { background:#0f1117; border-radius:20px; border:1px solid rgba(255,255,255,0.06); overflow:hidden; box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 32px 64px -12px rgba(0,0,0,0.5); animation:kurs-fadein 0.4s ease forwards; }
  .k26 .canva-content-wrapper .ProseMirror { padding:2.5rem 2rem; caret-color:transparent; color:#e2e8f0; line-height:1.8; font-size:16px; font-family:Inter,-apple-system,sans-serif; }
  .k26 .canva-content-wrapper .ProseMirror h1 { font-size:36px; font-weight:800; margin-bottom:20px; margin-top:32px; background:linear-gradient(135deg,#fff 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-0.02em; line-height:1.2; }
  .k26 .canva-content-wrapper .ProseMirror h2 { font-size:28px; font-weight:700; margin-bottom:16px; margin-top:40px; color:#f1f5f9; position:relative; padding-bottom:12px; }
  .k26 .canva-content-wrapper .ProseMirror h2::after { content:''; position:absolute; bottom:0; left:0; width:48px; height:3px; background:linear-gradient(90deg,#7c3aed,#a78bfa); border-radius:2px; }
  .k26 .canva-content-wrapper .ProseMirror h3 { font-size:22px; font-weight:600; margin-bottom:12px; margin-top:32px; color:#cbd5e1; }
  .k26 .canva-content-wrapper .ProseMirror p { margin-bottom:16px; color:#94a3b8; line-height:1.8; }
  .k26 .canva-content-wrapper .ProseMirror ul { list-style:none!important; padding:0!important; margin-bottom:24px; display:flex; flex-direction:column; gap:10px; }
  .k26 .canva-content-wrapper .ProseMirror ul li { display:flex; align-items:flex-start; gap:12px; padding:14px 18px; background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.15); border-radius:12px; color:#cbd5e1; font-size:15px; line-height:1.6; transition:all 0.2s ease; }
  .k26 .canva-content-wrapper .ProseMirror ul li p { margin:0; color:#cbd5e1; }
  .k26 .canva-content-wrapper .ProseMirror ul li:hover { background:rgba(124,58,237,0.1); border-color:rgba(124,58,237,0.3); transform:translateX(4px); }
  .k26 .canva-content-wrapper .ProseMirror strong, .k26 .canva-content-wrapper .ProseMirror b { color:#f1f5f9; font-weight:700; }
  .k26 .canva-content-wrapper .ProseMirror a { color:#a78bfa; text-decoration:none; border-bottom:1px solid rgba(167,139,250,0.4); transition:all 0.2s ease; }
  .k26 .canva-content-wrapper .ProseMirror a:hover { color:#c4b5fd; border-bottom-color:#c4b5fd; }
`
  const activityid = (await params.params).activityid
  const courseuuid = (await params.params).courseuuid
  const orgslug = (await params.params).orgslug

  return (
    <>
      {/* 2026 Premium Theme — injected from server component for guaranteed SSR */}
      <style dangerouslySetInnerHTML={{ __html: THEME_2026_CSS }} />
      <ActivityClient
      activityid={activityid}
      courseuuid={courseuuid}
      orgslug={orgslug}
      activity={null}
      course={null}
    />
  )
}

export default ActivityPage
