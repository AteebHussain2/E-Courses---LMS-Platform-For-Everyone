import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getCommunityAdminSEO } from "@/lib/seo";
import { Role } from "@/generated/prisma/enums";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import AdminTopbar from "@/components/topbar/AdminTopbar";
import CustomHeader from "@/components/ui/custom-header";

type Props = {
    params: Promise<{ communitySlug: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { userId } = await auth();
    if (!userId) redirect('/unauthorized')

    const data = await getCommunityAdminSEO((await params).communitySlug, userId);
    return data?.metadata ?? { title: "Community" };
}

export default async function RootLayout({ params, children }: Props) {
    const { userId } = await auth();
    if (!userId) redirect('/unauthorized')

    const { communitySlug } = await params;
    const seoData = await getCommunityAdminSEO(communitySlug, userId);

    if (!seoData || !seoData?.community) return notFound();
    if (seoData.community.communityMembers[0].role === Role.STUDENT) redirect(`/unauthorized?title="Access Denied"&description="You don't have access to this portal. Contact owner of this community to access admin portal."`);

    return (
        <div className="max-h-screen pt-3 flex flex-row flex-1 items-center justify-center">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.jsonLd) }}
            />

            <AdminSidebar
                slug={seoData.community.slug}
                name={seoData.community.name}
                logo={seoData.community.logo}
                role={seoData.community.communityMembers[0].role}
            />
            <div className="relative overflow-y-auto bg-background w-full h-full border border-border rounded-t-[20px] mx-3">
                <AdminTopbar />
                <main className="px-10 py-4 space-y-3">
                    <CustomHeader
                        slug={seoData.community.slug}
                        role={seoData.community.communityMembers[0].role}
                    />
                    {children}
                </main>
            </div>
        </div>
    );
}