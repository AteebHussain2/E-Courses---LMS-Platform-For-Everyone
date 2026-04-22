// src/app/[communitySlug]/(home)/courses/page.tsx
import { getStudentCoursesAction } from "@/actions/student/courses";
import { getEnrolledCoursesAction } from "@/actions/enrollments";
import CourseSection from "@/components/courses/CourseSection";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import { getFeaturedAction } from "@/actions/home";
import { auth } from "@clerk/nextjs/server";

type Props = {
    params: Promise<{ communitySlug: string }>
}

const RECENT_LIMIT = 6

const CoursesPage = async ({ params }: Props) => {
    const { communitySlug } = await params
    const { userId } = await auth()

    const [featured, recentCoursesData, enrolledCoursesData] = await Promise.all([
        getFeaturedAction(communitySlug).catch(() => null),
        getStudentCoursesAction(communitySlug, { sort: 'newest', offset: 0 })
            .catch(() => { return { courses: [], total: 0, hasMore: false } }),

        userId ? getEnrolledCoursesAction(userId, communitySlug, { sort: 'newest', offset: 0 })
            .catch(() => { return { courses: [], total: 0, hasMore: false } })
            : Promise.resolve({ courses: [], total: 0, hasMore: false }) // if no user, skip fetching enrolled courses
    ])

    const recentCourses = recentCoursesData?.courses ?? []
    const hasMoreRecentCourses = (recentCoursesData?.total ?? 0) > RECENT_LIMIT

    const enrolledCourses = enrolledCoursesData?.courses ?? []
    const hasMoreEnrolledCourses = (enrolledCoursesData?.total ?? 0) > RECENT_LIMIT

    return (
        <div className="space-y-5">
            {featured && <FeaturedBanner communitySlug={communitySlug} featured={featured} />}

            <CourseSection
                title="Recent Courses"
                courses={recentCourses}
                hasMore={hasMoreRecentCourses}
                limit={RECENT_LIMIT}
                communitySlug={communitySlug}
                viewMoreHref={`/${communitySlug}/courses/all`}
            />

            {enrolledCourses?.length > 0 && (
                <CourseSection
                    title="Enrolled Courses"
                    courses={enrolledCourses}
                    hasMore={hasMoreEnrolledCourses}
                    limit={RECENT_LIMIT}
                    communitySlug={communitySlug}
                    viewMoreHref={`/${communitySlug}/all`}
                />
            )}
        </div>
    )
}

export default CoursesPage