import StandaloneSessionForm from "@/components/sessions/StandaloneSessionForm";
import { getSessionAction } from "@/actions/sessions";
import { notFound, redirect } from "next/navigation";

type Props = {
    params: Promise<{ communitySlug: string }>
    searchParams: Promise<{ sessionId?: string }>
}

export default async function EditSessionPage({ params, searchParams }: Props) {
    const { communitySlug } = await params
    const { sessionId } = await searchParams

    if (!sessionId) redirect(`/${communitySlug}/admin/sessions`)

    const session = await getSessionAction(sessionId, communitySlug).catch(() => null)
    if (!session) return notFound()

    return <StandaloneSessionForm communitySlug={communitySlug} existingSession={session} />
}