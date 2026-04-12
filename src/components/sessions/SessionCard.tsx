"use client"

import { SESSION_STATUS_LABELS, SESSION_STATUS_STYLES, getSessionStatus } from "@/lib/session-status";
import { SessionDeleteButton } from "@/components/custom/buttons/SessionDeleteButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CalendarClock, ExternalLink, Link2, Radio, Video } from "lucide-react";
import { SessionStatus } from "@/generated/prisma/enums";
import { SessionWithDetails } from "@/actions/sessions";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const AdminSessionCard = ({ session, communitySlug }: { session: SessionWithDetails; communitySlug: string }) => {
    const scheduledAt = new Date(session.scheduledAt)
    const computedStatus = getSessionStatus({
        scheduledAt,
        status: session.status as SessionStatus,
        duration: session.duration
    })

    return (
        <Card className="w-full h-fit p-0! pb-4! gap-0! overflow-hidden">
            {/* Thumbnail / status hero */}
            <CardHeader className="p-0! relative">
                <div className="relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {session.imageUrl ? (
                        <Image
                            src={session.imageUrl}
                            alt={session.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <Radio className="size-10 text-muted-foreground/20" strokeWidth={1} />
                    )}

                    {/* Status pill */}
                    <div className={cn(
                        "absolute top-2.5 left-2.5 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide",
                        SESSION_STATUS_STYLES[computedStatus],
                        computedStatus === SessionStatus.LIVE && "animate-pulse"
                    )}>
                        {SESSION_STATUS_LABELS[computedStatus]}
                    </div>

                    {/* Recording badge */}
                    {session.recording && (
                        <div className="absolute top-2.5 right-2.5 text-[10px] font-medium bg-background/80 text-foreground px-2 py-0.5 rounded-full backdrop-blur-sm">
                            REC
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-4! pt-3.5! pb-0! space-y-2.5">
                {/* Title */}
                <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                    {session.title}
                </h4>

                {/* Schedule */}
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <CalendarClock className="size-3 shrink-0" />
                    <span>{format(scheduledAt, "dd MMM yyyy · h:mm a")}</span>
                    {session.duration && (
                        <span className="text-muted/60">· {session.duration}m</span>
                    )}
                </div>

                {/* Countdown for upcoming */}
                {computedStatus === SessionStatus.UPCOMING && (
                    <p className="text-xs text-primary font-medium">
                        Starts {formatDistanceToNow(scheduledAt, { addSuffix: true })}
                    </p>
                )}

                {/* Platform link */}
                {session.platformLink && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Link2 className="size-3 shrink-0" />
                        <Link
                            href={session.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:text-primary transition-colors"
                        >
                            {session.platformLink.replace(/^https?:\/\//, '').split('/')[0]}
                        </Link>
                    </div>
                )}

                {/* Linked lesson */}
                {session.lesson && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-xs text-primary">
                        <Video className="size-3 shrink-0" />
                        <span className="truncate">
                            {session.lesson.module.course.title} · {session.lesson.title}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-4! pt-3! pb-0! flex items-center gap-2">
                <Button
                    size='lg'
                    className="flex-1 w-full cursor-pointer rounded-full bg-[#0C1321] text-foreground hover:border-border hover:bg-[#0F1A2E] hover:text-foreground"
                >
                    <Link href={`/${communitySlug}/admin/sessions/edit?sessionId=${session.id}`}>
                        Edit
                    </Link>
                </Button>
                {session.platformLink && computedStatus === SessionStatus.UPCOMING || computedStatus === SessionStatus.LIVE ? (
                    <Button asChild size="sm" className="cursor-pointer text-foreground">
                        <a href={session.platformLink!} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-3.5" />
                            Join
                        </a>
                    </Button>
                ) : null}
                <SessionDeleteButton
                    sessionId={session.id}
                    sessionSlug={session.title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}
                    communitySlug={communitySlug}
                />
            </CardFooter>
        </Card >
    )
}