import { CourseWithInstructorAndCount } from "@/lib/types";
import StudentCourseCard from "./cards/StudentCourseCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type Props = {
    title: string
    courses: CourseWithInstructorAndCount[]
    hasMore: boolean
    communitySlug: string
    viewMoreHref: string
    limit: number
}

const CourseSection = ({ title, courses, hasMore, communitySlug, limit, viewMoreHref }: Props) => {
    return (
        <section className="px-10 py-2 space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl @min-3xl:text-2xl font-semibold text-foreground font-heading">
                    {title}
                </h2>
                {!hasMore && (
                    <Link
                        href={viewMoreHref}
                        className="flex items-center gap-1 text-sm text-status-info hover:text-status-info/80 transition-colors font-medium"
                    >
                        View More
                        <ArrowRight className="size-3.5" />
                    </Link>
                )}
            </div>

            {courses.length === 0 ? (
                <div className="px-4 flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-muted-foreground text-sm">No courses available yet.</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Check back soon!</p>
                </div>
            ) : (
                <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.slice(0, limit).map(course => (
                        <StudentCourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default CourseSection