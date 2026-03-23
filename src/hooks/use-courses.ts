import { getCoursesAction, CourseFilters } from "@/actions/courses";
import { useQuery } from "@tanstack/react-query";

const LIMIT = 12

export function useCourses(communitySlug: string, filters: CourseFilters, page: number) {
    const offset = (page - 1) * LIMIT

    return useQuery({
        queryFn: () => getCoursesAction(communitySlug, filters),
        queryKey: ['courses', communitySlug, filters],   // refetches when filter changes
    })
}