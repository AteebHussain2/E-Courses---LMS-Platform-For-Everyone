import { getCoursesAction, CourseFilters } from "@/actions/courses";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useCourses(communitySlug: string, filters: CourseFilters) {
    return useInfiniteQuery({
        queryFn: ({ pageParam = 0 }) => getCoursesAction(communitySlug, filters, pageParam),
        queryKey: ['courses', communitySlug, filters],   // refetches when filter changes
        initialPageParam: 0,
        getNextPageParam: (lastPage, _, lastPageParam) => {
            return lastPage.hasMore ? lastPageParam + 12 : undefined
        },
    })
}