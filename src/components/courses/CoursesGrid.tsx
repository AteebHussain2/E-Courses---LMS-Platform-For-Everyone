"use client"

import { useCourseFilters } from "@/hooks/use-course-filters";
import { useCourses } from "@/hooks/use-courses";
import { AdminCourseCard } from "./CourseCard";
import CourseFilters from "./CourseFilters";

const CoursesGrid = ({ communitySlug }: { communitySlug: string }) => {
    const { filters } = useCourseFilters()
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useCourses(communitySlug, filters)

    const courses = data?.pages.flatMap(page => page.courses) ?? []

    return (
        <div className="space-y-5">
            <CourseFilters communitySlug={communitySlug} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
                {courses.map(course => (
                    <AdminCourseCard key={course.id} course={course} />
                ))}
            </div>


        </div>
    )
}

export default CoursesGrid
