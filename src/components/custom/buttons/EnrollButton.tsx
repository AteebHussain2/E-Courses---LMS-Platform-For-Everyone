import { cn } from "@/lib/utils"
import { BookOpen, Radio } from "lucide-react"
import Link from "next/link"

type EnrollButtonProps = {
    isSession: boolean
    isLive: boolean
    platformLink: string | null
    communitySlug: string
    courseSlug: string
}

const EnrollButton = ({ isSession, isLive, platformLink, communitySlug, courseSlug }: EnrollButtonProps) => {
    const primaryLabel = isLive ? "Join Now" : isSession ? "Save Seat" : "Enroll Now"
    const primaryHref = isSession
        ? (isLive
            ? platformLink ?? `/${communitySlug}/sessions`
            : `/${communitySlug}/sessions`)
        : `/${communitySlug}/courses/${courseSlug}`

    return (
        <Link
            href={primaryHref}
            className="inline-flex flex-1 items-center justify-center gap-2 bg-primary hover:bg-primary/85 transition-colors text-white px-4 py-3 rounded-full text-sm font-medium"
        >
            {isSession ?
                <Radio className="size-4 pt-px" /> :
                <BookOpen className="size-4 pt-px" />
            }
            {primaryLabel}
        </Link>
    )
}

export default EnrollButton
