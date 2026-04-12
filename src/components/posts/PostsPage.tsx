"use client"

import { usePostFilters } from "@/hooks/use-post-filters";
import { PostFilters as PostFiltersType } from "@/actions/posts";
import { usePosts } from "@/hooks/use-posts";
import PostFilters from "./PostFilters";
import PostCard from "./PostCard";
import Pagination from "../Pagination";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsPage({ communitySlug }: { communitySlug: string }) {
    const { filters, setPage } = usePostFilters()

    const apiFilters: PostFiltersType = {
        type: filters.type === 'all' ? 'all' : filters.type.toUpperCase() as any,
        time: filters.time,
        sort: filters.sort,
    }

    const { data, isLoading } = usePosts(communitySlug, apiFilters)

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <PostFilters />
                <Button asChild className="cursor-pointer text-foreground rounded-sm">
                    <Link href={`/${communitySlug}/admin/posts/add`}>
                        <Plus className="size-4" /> New Post
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4 max-w-2xl">
                    Loading...
                    {/* {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))} */}
                </div>
            ) : data?.posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <FileText className="size-10 text-muted/30" strokeWidth={1} />
                    <p className="text-sm text-muted">No posts yet</p>
                    <Button asChild size="sm" variant="outline" className="cursor-pointer border-border">
                        <Link href={`/${communitySlug}/admin/posts/add`}>Create first post</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4 max-w-2xl">
                    {data?.posts.map(post => (
                        <PostCard key={post.id} post={post} communitySlug={communitySlug} />
                    ))}
                </div>
            )}

            <Pagination
                total={data?.total ?? 0}
                currentPage={filters.page}
                onPageChange={setPage}
            />
        </div>
    )
}