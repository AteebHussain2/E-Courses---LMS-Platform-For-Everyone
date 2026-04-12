import PostsPage from "@/components/posts/PostsPage";

type PostPageProps = {
    params: Promise<{
        communitySlug: string
    }>
}

export default async function AdminPostsPage({ params }: PostPageProps) {
    const { communitySlug } = await params
    return <PostsPage communitySlug={communitySlug} />
}