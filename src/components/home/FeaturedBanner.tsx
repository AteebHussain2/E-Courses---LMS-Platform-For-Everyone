"use client"

import { BookOpen, CalendarClock, Plus, Radio, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FeaturedData } from "@/actions/home";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Props = {
    communitySlug: string
    featured: FeaturedData | null
}

export default function FeaturedBanner({ communitySlug, featured }: Props) {
    if (!featured) return null

    const isSession = featured.type === 'session'
    const isLive = featured.badge === 'live'
    const isUpcoming = featured.badge === 'upcoming'
    const isCourse = featured.type === 'course'

    const imageUrl = featured.item.imageUrl
    const title = featured.item.title
    const description = featured.item.description

    const primaryHref = isSession
        ? (isLive
            ? (featured.item as any).platformLink ?? `/${communitySlug}/sessions`
            : `/${communitySlug}/sessions`)
        : `/${communitySlug}/courses/${(featured.item as any).slug}`

    const primaryLabel = isLive ? "Join Now" : isCourse ? "Enroll Now" : "Save Seat"
    const secondaryLabel = isSession ? "+ Save in Library" : "+ Save in Courses"

    return (
        <div className="relative w-full rounded-t-[20px] overflow-clip bg-[#0d0d12] min-h-55 sm:min-h-[50vh] flex items-center">
            {/* Right side image */}
            {imageUrl && (
                <>
                    <div className="absolute inset-0 right-0 w-full">
                        <Image
                            src={imageUrl}
                            alt={title}
                            width={420}
                            height={420}
                            className=""
                            priority
                        />
                    </div>
                    {/* gradient overlays — left fade + bottom scrim */}
                    <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-transparent w-[65%]" />
                    <div className="absolute inset-0 bg-linear-to-r from-[#0d0d12] to-transparent" style={{ width: '40%' }} />
                </>
            )}

            {!imageUrl && (
                <div className="absolute inset-0 bg-linear-to-br from-[#0d0d12] to-[#1a1a2e]" />
            )}

            {/* Content */}
            <div className="relative z-10 px-7 py-8 max-w-[52%] space-y-4">

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 border border-white/10 px-3 py-1 rounded-full">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                            </span>
                            Live Now
                        </span>
                    )}

                    {isUpcoming && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 border border-white/10 px-3 py-1 rounded-full">
                            <CalendarClock className="size-3 text-primary" />
                            {formatDistanceToNow(new Date((featured.item as any).scheduledAt), { addSuffix: true })}
                        </span>
                    )}

                    {isCourse && (
                        <>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 border border-white/10 px-3 py-1 rounded-full">
                                <span className="relative flex size-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full size-2 bg-green-500" />
                                </span>
                                New
                            </span>
                            {(featured.item as any)._count?.enrollments > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                    <Users className="size-3" />
                                    {(featured.item as any)._count.enrollments} enrolled
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Title */}
                <h2 className={cn(
                    "font-heading font-semibold text-white leading-tight",
                    title.length > 40 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                )}>
                    {title}
                </h2>

                {/* Description */}
                {description && (
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-3 max-w-xs">
                        {description}
                    </p>
                )}

                {/* CTAs */}
                <div className="flex items-center gap-4 pt-1">
                    <Link
                        href={primaryHref}
                        className={cn(
                            "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
                            isLive
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "bg-primary text-white hover:bg-primary/90"
                        )}
                    >
                        {isSession && <Radio className="size-3.5" />}
                        {isCourse && <BookOpen className="size-3.5" />}
                        {primaryLabel}
                    </Link>

                    <button className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
                        <Plus className="size-3.5" />
                        {secondaryLabel}
                    </button>
                </div>
            </div>

            {/* Live pulse ring on right edge — only for live sessions */}
            {isLive && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 size-3 hidden sm:block">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40" />
                    <span className="relative inline-flex rounded-full size-3 bg-red-500" />
                </div>
            )}
        </div>
    )
}