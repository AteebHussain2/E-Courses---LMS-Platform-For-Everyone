import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommunitySEO } from "@/lib/seo";

type Props = {
    params: Promise<{ communitySlug: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getCommunitySEO((await params).communitySlug);
    return data?.metadata ?? { title: "Community" };
}

export default async function RootLayout({ params, children }: Props) {
    const { communitySlug } = await params;
    const seoData = await getCommunitySEO(communitySlug);

    if (!seoData || !seoData?.community) return notFound();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.jsonLd) }}
            />
            {children}
        </>
    );
}