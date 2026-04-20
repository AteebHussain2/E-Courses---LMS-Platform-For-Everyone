import CourseNotFound from "@/components/courses/CourseNotFound";
import { checkEnrollmentAction } from "@/actions/enrollments";
import { getModulesActionWithSlug } from "@/actions/modules";
import { getCourseActionWithSlug } from "@/actions/courses";
import CourseDetails from "@/components/home/CourseDetails";
import CourseBanner from "@/components/home/CourseBanner";
import { auth } from "@clerk/nextjs/server";

type Props = {
    params: Promise<{ communitySlug: string; courseSlug: string }>
}

export default async function CourseDetailPage({ params }: Props) {
    const { communitySlug, courseSlug } = await params
    const { userId } = await auth()

    const [course, modules] = await Promise.all([
        getCourseActionWithSlug(courseSlug, communitySlug).catch(() => null),
        getModulesActionWithSlug(courseSlug, communitySlug).catch(() => []),
    ])

    if (!course) return (
        <CourseNotFound
            title="Course Not Found"
            description="This course doesn't exist or isn't available yet."
            communitySlug={communitySlug}
            showSearch
        />
    )

    // Check if current user is enrolled (null for guests)
    const enrollment = userId
        ? await checkEnrollmentAction(userId, course.id).catch(() => null)
        : null
    const isEnrolled = !!enrollment

    return (
        <div className="space-y-5">
            <CourseBanner
                course={course}
                communitySlug={communitySlug}
                isEnrolled={isEnrolled}
            />

            <CourseDetails
                course={course}
                modules={modules}
                isEnrolled={isEnrolled}
                communitySlug={communitySlug}
            />
        </div>
    )
}