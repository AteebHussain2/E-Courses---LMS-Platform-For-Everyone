import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/posts/PostForm";
import { getPostAction } from "@/actions/posts";
import { auth } from "@clerk/nextjs/server";

type Props = {
    params: Promise<{ communitySlug: string }>
    searchParams: Promise<{ postId?: string }>
}

export default async function EditPostPage({ params, searchParams }: Props) {
    const { communitySlug } = await params
    const { postId } = await searchParams
    const { userId } = await auth()

    if (!userId) redirect('/sign-in')
    if (!postId) redirect(`/${communitySlug}/admin/posts`)

    const post = await getPostAction(postId).catch(() => null)
    if (!post) return notFound()

    return <PostForm communitySlug={communitySlug} authorId={userId} existingPost={post} />
}