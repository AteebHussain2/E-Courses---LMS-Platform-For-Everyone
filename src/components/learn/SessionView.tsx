import { SESSION_STATUS_LABELS, SESSION_STATUS_STYLES, getSessionStatus } from "@/lib/session-status";
import { CalendarClock, Clock, ExternalLink, Radio, Video } from "lucide-react";
import { format, formatDistanceToNow, isFuture } from "date-fns";
import { SessionStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Session = {
    id: string
    title: string
    description: string | null
    scheduledAt: Date | string
    duration: number | null
    platformLink: string | null
    imageUrl: string | null
    status: SessionStatus
    recording?: { id: string; videoUrl: string | null; title: string } | null
}

type Props = { session: Session }

export default function SessionView({ session }: Props) {
    const scheduledAt = new Date(session.scheduledAt)
    const computedStatus = getSessionStatus({
        scheduledAt,
        status: session.status,
        duration: session.duration,
    })
    const isLive = computedStatus === SessionStatus.LIVE
    const isUpcoming = computedStatus === SessionStatus.UPCOMING
    const isCompleted = computedStatus === SessionStatus.COMPLETED
    const isCancelled = computedStatus === SessionStatus.CANCELLED

    return (
        <div className="space-y-6">
            {/* Session thumbnail / status hero */}
            <div className="relative w-full aspect-video bg-[#0d0d14] rounded-xl overflow-hidden flex items-center justify-center">
                {session.imageUrl ? (
                    <Image
                        src={session.imageUrl}
                        alt={session.title}
                        fill
                        className={cn(
                            "object-cover",
                            (isUpcoming || isCancelled) && "opacity-40"
                        )}
                    />
                ) : (
                    <Radio className="size-12 text-muted/20" strokeWidth={1} />
                )}

                {/* Status badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <span className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide",
                        SESSION_STATUS_STYLES[computedStatus],
                        isLive && "animate-pulse"
                    )}>
                        {isLive && "● "}{SESSION_STATUS_LABELS[computedStatus]}
                    </span>

                    {/* Join button for live sessions */}
                    {isLive && session.platformLink && (
                        <Button asChild className="gap-2 cursor-pointer text-foreground">
                            <Link href={session.platformLink} target="_blank">
                                <ExternalLink className="size-4" />
                                Join Live Session
                            </Link>
                        </Button>
                    )}

                    {isUpcoming && (
                        <p className="text-sm text-white/70 font-medium">
                            Starts {formatDistanceToNow(scheduledAt, { addSuffix: true })}
                        </p>
                    )}
                </div>
            </div>

            {/* Schedule details */}
            <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="size-4 text-primary/70" />
                    <span>{format(scheduledAt, "EEEE, dd MMMM yyyy · h:mm a")}</span>
                </div>
                {session.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>{session.duration} min</span>
                    </div>
                )}
                {!isLive && session.platformLink && isUpcoming && (
                    <Button asChild size="sm" variant="outline" className="gap-1.5 border-border bg-input cursor-pointer ml-auto">
                        <Link href={session.platformLink} target="_blank">
                            <ExternalLink className="size-3.5" />
                            Platform Link
                        </Link>
                    </Button>
                )}
            </div>

            {/* Recording (completed sessions) */}
            {isCompleted && session.recording?.videoUrl && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Video className="size-4 text-primary" />
                        Session Recording
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                            src={session.recording.videoUrl}
                            title={session.recording.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                            allowFullScreen
                            className="size-full"
                        />
                    </div>
                </div>
            )}

            {isCompleted && !session.recording?.videoUrl && (
                <div className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground text-center">
                    Recording not yet available for this session.
                </div>
            )}
        </div>
    )
}