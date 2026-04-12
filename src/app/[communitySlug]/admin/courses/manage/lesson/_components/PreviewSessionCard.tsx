"use client"

import { SESSION_STATUS_LABELS, SESSION_STATUS_STYLES, getSessionStatus } from "@/lib/session-status";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CalendarClock, Copy, ExternalLink, Link2, Radio } from "lucide-react";
import { format, formatDistanceToNow, isFuture } from "date-fns";
import { SessionStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { cn, getUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

type PreviewSessionCardProps = {
    communitySlug: string
    lessonId: string
    lessonTitle: string
    session: {
        title: string
        imageUrl?: string | null
        description?: string | null
        scheduledAt: Date | string
        duration?: number | null
        platformLink?: string | null
        status: SessionStatus
    } | null
}

export default function PreviewSessionCard({
    lessonId,
    session,
}: PreviewSessionCardProps) {
    const lessonUrl = getUrl(`/learn?v=${lessonId}`).toString()

    if (!session) {
        return (
            <div className="space-y-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">
                    Student Preview
                </p>
                <Card className="w-full max-w-sm p-4! gap-0!">
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                        <Radio className="size-8 text-muted-foreground/30" strokeWidth={1} />
                        <p className="text-xs text-muted">Fill in the session details to see a preview</p>
                    </div>
                </Card>
            </div>
        )
    }

    const scheduledAt = new Date(session.scheduledAt)
    const computedStatus = getSessionStatus({ scheduledAt: scheduledAt, status: session.status, duration: session.duration ?? null })
    const isUpcoming = isFuture(scheduledAt) && computedStatus !== SessionStatus.CANCELLED

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Student Preview
            </p>

            <Card className="w-full max-w-sm p-0! pb-3! gap-3! overflow-hidden">
                {/* Thumbnail / hero */}
                <CardHeader className="p-0!">
                    <div className="relative w-full aspect-video bg-secondary/2 border-b border-border flex items-center justify-center">
                        {session.imageUrl ? (
                            <Image
                                src={session.imageUrl}
                                alt={session.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Radio className="size-10 text-muted-foreground/30" strokeWidth={1} />
                        )}

                        {/* Status pill — always visible */}
                        <div className={cn(
                            "absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
                            SESSION_STATUS_STYLES[computedStatus],
                            computedStatus === SessionStatus.LIVE && "animate-pulse"
                        )}>
                            {SESSION_STATUS_LABELS[computedStatus]}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4! py-0! space-y-2.5">
                    {/* Title */}
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                        {session.title}
                    </h4>

                    {/* Schedule row */}
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <CalendarClock className="size-3 shrink-0" />
                        <span>
                            {format(scheduledAt, "dd MMM yyyy · h:mm a")}
                            {session.duration && (
                                <span className="ml-1 text-muted-foreground/60">
                                    · {session.duration} min
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Countdown — only for upcoming sessions */}
                    {isUpcoming && (
                        <div className="text-xs text-primary font-medium">
                            Starts {formatDistanceToNow(scheduledAt, { addSuffix: true })}
                        </div>
                    )}

                    {/* Platform link */}
                    {session.platformLink && (
                        <div className="items-center gap-1.5 text-xs text-muted hidden">
                            <Link2 className="size-3 shrink-0" />
                            <a
                                href={session.platformLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground truncate transition-colors"
                            >
                                {session.platformLink.replace(/^https?:\/\//, '')}
                            </a>
                        </div>
                    )}

                    {/* Description */}
                    {session.description && (
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                            {session.description}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="px-4! pb-0! flex flex-col items-center gap-3">
                    <div className="flex items-center justify-between gap-2 w-full">
                        <Link
                            href={lessonUrl}
                            className="w-full text-primary underline text-sm"
                        >
                            /{lessonUrl.split('/').slice(3).join('/')}
                        </Link>

                        <Button
                            variant="ghost"
                            className="hover:cursor-pointer"
                            size="icon-sm"
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(lessonUrl)
                                toast.success("Lesson URL copied to clipboard")
                            }}
                        >
                            <Copy />
                        </Button>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 border-border bg-input cursor-pointer text-xs"
                    >
                        <Link href={lessonUrl} target="_blank">
                            <ExternalLink className="size-3" />
                            View Lesson Page
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}