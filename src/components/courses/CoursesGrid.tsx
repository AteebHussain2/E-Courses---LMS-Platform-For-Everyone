"use client"

import { useCourseFilters } from "@/hooks/use-course-filters";
import { useCourses } from "@/hooks/use-courses";
import { AdminCourseCard } from "./CourseCard";
import CourseFilters from "./CourseFilters";
import Pagination from "../Pagination";

const CoursesGrid = ({ communitySlug }: { communitySlug: string }) => {
    const { filters, setPage } = useCourseFilters()
    const { data, isLoading } = useCourses(communitySlug, filters, filters.page)

    return (
        <div className="space-y-5">
            <CourseFilters communitySlug={communitySlug} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
                {!isLoading ? data?.courses?.map(course => (
                    <AdminCourseCard key={course.id} course={course} />
                )) : (
                    <>Loading...</>
                )}
            </div>

            <Pagination
                total={data?.total ?? 0}
                currentPage={filters.page}
                onPageChange={setPage}
            />
        </div>
    )
}

export default CoursesGrid
