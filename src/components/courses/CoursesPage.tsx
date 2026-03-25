"use client"

import { useCourseFilters } from "@/hooks/use-course-filters";
import { useCourses } from "@/hooks/use-courses";
import CourseFilters from "./CourseFilters";
import CoursesGrid from "./CoursesGrid";
import Pagination from "../Pagination";
import { AddCourseButton } from "../CustomButtons";

const CoursesPage = ({ communitySlug }: { communitySlug: string }) => {
    const { filters, setPage } = useCourseFilters()
    const { data, isLoading } = useCourses(communitySlug, filters)

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <CourseFilters communitySlug={communitySlug} />
                <AddCourseButton className="w-32 rounded-sm!" />
            </div>

            <CoursesGrid isLoading={isLoading} courses={data?.courses} />

            <Pagination
                total={data?.total ?? 0}
                currentPage={filters.page}
                onPageChange={setPage}
            />
        </div>
    )
}

export default CoursesPage
