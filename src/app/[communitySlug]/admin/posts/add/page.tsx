import PostForm from "@/components/posts/PostForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ communitySlug: string }> }

export default async function AddPostPage({ params }: Props) {
    const { communitySlug } = await params
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    return <PostForm communitySlug={communitySlug} authorId={userId} />
}