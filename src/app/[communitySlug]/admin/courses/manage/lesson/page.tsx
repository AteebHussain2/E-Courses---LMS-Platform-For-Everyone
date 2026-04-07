import LessonPageClient from "./_components/LessonPageClient";
import { notFound, redirect } from "next/navigation";
import { getLessonAction } from "@/actions/lessons";

type Props = {
    params: Promise<{ communitySlug: string }>
    searchParams: Promise<{ lessonId?: string }>
}

export default async function LessonPage({ params, searchParams }: Props) {
    const { communitySlug } = await params
    const { lessonId } = await searchParams

    if (!lessonId) redirect(`/${communitySlug}/admin/courses`)

    const lesson = await getLessonAction(lessonId)
    if (!lesson) return notFound()

    // JSON-LD Event schema — only for session-type lessons
    const jsonLd = lesson.type === 'SESSION' && lesson.session ? (() => {
        const session = lesson.session
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.FRONTEND_URL ?? ''
        const startDate = new Date(session.scheduledAt)
        const endDate = session.duration
            ? new Date(startDate.getTime() + session.duration * 60_000)
            : null

        return {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": session.title,
            "description": session.description ?? undefined,
            "startDate": startDate.toISOString(),
            ...(endDate && { "endDate": endDate.toISOString() }),
            "eventStatus": session.status === 'CANCELLED'
                ? "https://schema.org/EventCancelled"
                : "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
                "@type": "VirtualLocation",
                "url": session.platformLink ?? `${baseUrl}/${communitySlug}/learn/${lesson.slug}`
            },
            "url": `${baseUrl}/${communitySlug}/learn/${lesson.slug}`,
            ...(session.imageUrl && { "image": session.imageUrl }),
        }
    })() : null

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <LessonPageClient
                lesson={lesson}
                communitySlug={communitySlug}
            />
        </>
    )
}