import { checkEnrollmentAction } from "@/actions/enrollments";
import LessonSidebar from "@/components/sidebar/LessonSidebar";
import { getModulesAction } from "@/actions/modules";
import { getCourseAction } from "@/actions/courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = {
    params: Promise<{ communitySlug: string; courseId: string }>
    children: React.ReactNode
}

export default async function LessonLayout({ params, children }: Props) {
    const { communitySlug, courseId } = await params
    const { userId } = await auth()

    if (!userId) redirect(`/sign-in`)

    const [course, modules] = await Promise.all([
        getCourseAction(courseId, communitySlug).catch(() => null),
        getModulesAction(courseId, communitySlug).catch(() => []),
    ])

    if (!course) redirect(`/${communitySlug}/courses`)

    // Enrollment gate — non-enrolled users can't access lesson player
    const enrollment = await checkEnrollmentAction(userId, courseId).catch(() => null)
    if (!enrollment) redirect(`/${communitySlug}/course/${courseId}`)

    return (
        <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden">
            <LessonSidebar
                modules={modules}
                course={course}
                communitySlug={communitySlug}
            />

            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    )
}