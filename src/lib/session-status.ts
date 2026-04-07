import { SessionStatus } from "@/generated/prisma/enums"

type SessionStatusInput = {
    scheduledAt: Date | string
    duration: number | null
    status: SessionStatus
}

// Default session duration when none is provided
const DEFAULT_DURATION_MINUTES = 90

/**
 * Derives the effective session status from schedule data.
 *
 * CANCELLED is the only status that is persisted and respected as a hard override.
 * UPCOMING / LIVE / COMPLETED are always computed — never trust what's stored for these.
 */
export function getSessionStatus(session: SessionStatusInput): SessionStatus {
    if (session.status === SessionStatus.CANCELLED) return SessionStatus.CANCELLED

    const now = new Date()
    const start = new Date(session.scheduledAt)
    const durationMs = (session.duration ?? DEFAULT_DURATION_MINUTES) * 60_000
    const end = new Date(start.getTime() + durationMs)

    if (now < start) return SessionStatus.UPCOMING
    if (now >= start && now <= end) return SessionStatus.LIVE
    return SessionStatus.COMPLETED
}

/**
 * Human-readable label for a computed status.
 */
export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
    UPCOMING: "Upcoming",
    LIVE: "Live Now",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
}

/**
 * Tailwind classes for status badge styling.
 */
export const SESSION_STATUS_STYLES: Record<SessionStatus, string> = {
    UPCOMING: "bg-primary/10 text-primary",
    LIVE: "bg-green-500/15 text-green-400",
    COMPLETED: "bg-muted text-muted-foreground",
    CANCELLED: "bg-destructive/10 text-destructive",
}