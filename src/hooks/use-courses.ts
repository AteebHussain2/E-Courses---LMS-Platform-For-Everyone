import { getCoursesAction, CourseFilters } from "@/actions/courses";
import { useQuery } from "@tanstack/react-query";

export function useCourses(communitySlug: string, filters: CourseFilters) {
    return useQuery({
        queryFn: () => getCoursesAction(communitySlug, filters),
        queryKey: ['courses', communitySlug, filters],   // refetches when filter changes
        refetchOnReconnect: false,
        staleTime: 1000 * 3600 * 1,
    })
}