import { checkEnrollmentAction } from "@/actions/enrollments";
import LessonSidebar from "@/components/sidebar/LessonSidebar";
import { getModulesAction } from "@/actions/modules";
import { getCourseAction } from "@/actions/courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CourseTopbar from "@/components/topbar/CourseTopbar";

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
        <div className="max-h-screen flex flex-row flex-1 items-start justify-center">
            <LessonSidebar
                modules={modules}
                course={course}
                communitySlug={communitySlug}
            />

            <div className="relative w-full max-h-screen mr-3">
                <CourseTopbar communitySlug={communitySlug} courseSlug={course.slug} />
                <main className="px-10 py-4 space-y-3 bg-background w-full min-h-[calc(100vh-84px)] h-full border-x border-border">
                    {children}
                </main>
            </div>
        </div>
    )
}