"use server"

import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export async function getCommunitySEO(slug: string) {
    const community = await prisma.community.findUnique({
        where: { slug: slug },
    });

    if (!community) return null;

    const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

    const metadata: Metadata = {
        title: `${community.name} | ${community.slogan}`,
        description: community.description,
        alternates: { canonical: `${baseUrl}/${slug}` },
        openGraph: {
            title: community.name,
            description: community.description ?? "",
            url: `${baseUrl}/${slug}`,
            siteName: "ECourses Pakistan",
            images: [{ url: community.logo ?? "/default-og.png" }],
            type: "website",
        },
        other: {
            "geo.region": "PK",
            "geo.placename": "Lahore",
        },
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "EducationalOrganization",
                "@id": `${baseUrl}/${slug}/#organization`,
                "name": community.name,
                "url": `${baseUrl}/${slug}`,
                "logo": community.logo,
                "description": community.description,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Lahore",
                    "addressCountry": "PK"
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/${slug}/home` },
                    { "@type": "ListItem", "position": 2, "name": "Courses", "item": `${baseUrl}/${slug}/courses` },
                    { "@type": "ListItem", "position": 3, "name": "Sessions", "item": `${baseUrl}/${slug}/sessions` },
                    { "@type": "ListItem", "position": 4, "name": "Community", "item": `${baseUrl}/${slug}/community/general` },
                    { "@type": "ListItem", "position": 5, "name": community.name, "item": `${baseUrl}/${slug}` }
                ]
            }
        ]
    };

    return { metadata, jsonLd, community };
}

export async function getCommunityAdminSEO(slug: string, userId: string) {
    const community = await prisma.community.findUnique({
        where: { slug: slug },
        include: {
            communityMembers: {
                where: { userId },
                select: {
                    role: true,
                    user: {
                        select: {
                            avatar: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
    });

    if (!community) return null;

    const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

    const metadata: Metadata = {
        title: `Admin ${community.name} | ${community.slogan}`,
        description: community.description,
        alternates: { canonical: `${baseUrl}/${slug}` },
        openGraph: {
            title: community.name,
            description: community.description ?? "",
            url: `${baseUrl}/${slug}`,
            siteName: "ECourses Pakistan",
            images: [{ url: community.logo ?? "/default-og.png" }],
            type: "website",
        },
        other: {
            "geo.region": "PK",
            "geo.placename": "Lahore",
        },
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "EducationalOrganization",
                "@id": `${baseUrl}/${slug}/#organization`,
                "name": community.name,
                "url": `${baseUrl}/${slug}`,
                "logo": community.logo,
                "description": community.description,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Lahore",
                    "addressCountry": "PK"
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/${slug}/home` },
                    { "@type": "ListItem", "position": 2, "name": "Courses", "item": `${baseUrl}/${slug}/courses` },
                    { "@type": "ListItem", "position": 3, "name": "Sessions", "item": `${baseUrl}/${slug}/sessions` },
                    { "@type": "ListItem", "position": 4, "name": "Community", "item": `${baseUrl}/${slug}/community/general` },
                    { "@type": "ListItem", "position": 5, "name": community.name, "item": `${baseUrl}/${slug}` }
                ]
            }
        ]
    };

    return { metadata, jsonLd, community };
}