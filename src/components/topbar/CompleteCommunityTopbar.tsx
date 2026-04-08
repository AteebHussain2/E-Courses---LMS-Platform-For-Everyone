"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import Link from 'next/link';

type CompleteCommunityTopbarProps = {
    slug: string | null;
    logo: string | null;
    name: string | null;
    description: string | null;
}

const COOKIE_NAME = "community-nudge-hidden";

const MESSAGES = [
    "Your community is missing its soul! Add a description to stand out.",
    "First impressions matter. Upload a logo to make your community official.",
    "A complete profile grows 3x faster. Let's finish setting things up!",
    "Ready to go live? Your community details are looking a bit lonely.",
    "Personalize your space! Add a name and logo to welcome your members.",
    "Don't leave them guessing. Complete your community bio today.",
    "Almost there! Just a few more details to make this community shine."
];

const CompleteCommunityTopbar = ({ slug, name, logo, description }: CompleteCommunityTopbarProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 1. Check if any prop is missing
        const isIncomplete = !name || !logo || !description;

        // 2. Check if the "dismissed" cookie exists
        const isDismissed = Cookies.get(COOKIE_NAME);

        if (isIncomplete && !isDismissed && slug) {
            setIsVisible(true);
        }
    }, [name, logo, description, slug]);

    const handleDismiss = () => {
        // Set cookie to expire in 1 day (24 hours)
        Cookies.set(COOKIE_NAME, "true", { expires: 1 });
        setIsVisible(false);
    };

    // Generate a "unique" message for the day based on the date index
    const getDailyMessage = () => {
        const dayOfYear = parseInt(format(new Date(), 'D'));
        return MESSAGES[dayOfYear % MESSAGES.length];
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-100 w-full bg-primary text-primary-foreground shadow-md animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Sparkles className="h-4 w-4 shrink-0 text-yellow-400" />
                    <p className="text-sm font-medium truncate">
                        {getDailyMessage()}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={handleDismiss}
                    >
                        <Link href={`/${slug}/admin/settings`}>
                            Complete Profile
                        </Link>
                    </Button>

                    <Button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
                        aria-label="Close notification"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CompleteCommunityTopbar