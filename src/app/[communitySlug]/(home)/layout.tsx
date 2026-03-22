import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommunitySEO } from "@/lib/seo";
import HomeSidebar from "@/components/sidebar/HomeSidebar";
import { Role } from "@/generated/prisma/enums";

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
        <div className="max-h-screen pt-3 flex flex-row flex-1 items-center justify-center">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.jsonLd) }}
            />

            <HomeSidebar
                slug={seoData.community.slug}
                name={seoData.community.name}
                logo={seoData.community.logo}
                role={Role.STUDENT}
            />
            <main className="overflow-y-auto bg-background w-full h-full border border-border rounded-t-[20px] mx-3">
                {children}
            </main>
        </div>
    );
}