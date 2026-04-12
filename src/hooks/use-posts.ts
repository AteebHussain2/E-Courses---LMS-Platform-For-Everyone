import { getPostsAction, PostFilters } from "@/actions/posts";
import { useQuery } from "@tanstack/react-query";

export function usePosts(communitySlug: string, filters: PostFilters) {
    return useQuery({
        queryFn: () => getPostsAction(communitySlug, filters),
        queryKey: ['posts', communitySlug, filters],
        refetchOnReconnect: false,
        staleTime: 1000 * 60,
    })
}