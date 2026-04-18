import { getFeaturedCourseAction } from "@/actions/home";
import FeaturedBanner from "@/components/home/FeaturedBanner";

type Props = {
    params: Promise<{ communitySlug: string }>
}

const CoursesPage = async ({ params }: Props) => {
    const { communitySlug } = await params;
    const featured = await getFeaturedCourseAction(communitySlug).catch(() => null)

    return (
        <div className="space-y-5">
            <FeaturedBanner communitySlug={communitySlug} featured={featured} />
        </div>
    )
}

export default CoursesPage
