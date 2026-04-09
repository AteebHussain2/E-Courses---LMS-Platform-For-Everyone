import StandaloneSessionForm from "@/components/sessions/StandaloneSessionForm";

type Props = { params: Promise<{ communitySlug: string }> }

export default async function AddSessionPage({ params }: Props) {
    const { communitySlug } = await params
    return <StandaloneSessionForm communitySlug={communitySlug} />
}