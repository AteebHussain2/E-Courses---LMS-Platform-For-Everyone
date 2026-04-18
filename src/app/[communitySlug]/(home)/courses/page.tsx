import StudentCourseCard from "@/components/courses/cards/StudentCourseCard";
import { getStudentCoursesAction } from "@/actions/student/courses";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import { getFeaturedAction } from "@/actions/home";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import CourseSection from "@/components/courses/CourseSection";

type Props = {
    params: Promise<{ communitySlug: string }>
}

const RECENT_LIMIT = 6 // show 6 on this page; "View More" goes to paginated /courses/all

const CoursesPage = async ({ params }: Props) => {
    const { communitySlug } = await params

    const [featured, coursesData] = await Promise.all([
        getFeaturedAction(communitySlug).catch(() => null),
        getStudentCoursesAction(communitySlug, { sort: 'newest', offset: 0 }).catch(() => null),
    ])

    const courses = coursesData?.courses ?? []
    const hasMore = (coursesData?.total ?? 0) > RECENT_LIMIT

    return (
        <div className="space-y-5">
            {featured && <FeaturedBanner communitySlug={communitySlug} featured={featured} />}

            <CourseSection
                title="Recent Courses"
                courses={courses}
                hasMore={hasMore}
                limit={RECENT_LIMIT}
                communitySlug={communitySlug}
            />
        </div>
    )
}

export default CoursesPage