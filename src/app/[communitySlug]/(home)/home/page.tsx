import FeaturedBanner from "@/components/home/FeaturedBanner";
import { getFeaturedAction } from "@/actions/home";

type Props = {
    params: Promise<{ communitySlug: string }>
}

const HomePage = async ({ params }: Props) => {
    const { communitySlug } = await params
    const featured = await getFeaturedAction(communitySlug).catch(() => null)

    return (
        <div className="space-y-6 p-6">
            <FeaturedBanner communitySlug={communitySlug} featured={featured} />
        </div>
    )
}

export default HomePage