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

    return (
        <LessonPageClient
            lesson={lesson}
            communitySlug={communitySlug}
        />
    )
}