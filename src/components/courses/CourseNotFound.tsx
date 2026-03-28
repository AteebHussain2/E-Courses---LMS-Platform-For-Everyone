"use client"

import { useRouter } from "next/navigation"
import { BookX, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CourseNotFoundProps = {
    title?: string
    description?: string
    showBack?: boolean
    backUrl?: string
    showSearch?: boolean
    className?: string
    communitySlug?: string
}

export default function CourseNotFound({
    title = "Course Not Found",
    description = "The course you're looking for doesn't exist, was removed, or is not yet available.",
    showBack = true,
    showSearch = true,
    backUrl,
    className,
    communitySlug
}: CourseNotFoundProps) {
    const router = useRouter()

    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[60vh] px-4 select-none", className)}>

            {/* Animated Icon Block */}
            <div className="relative mb-8">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-destructive/10 blur-2xl scale-150 animate-pulse" />

                {/* Dashed rotating ring */}
                <div
                    className="absolute inset-0 rounded-full border-2 border-dashed border-destructive/20"
                    style={{ animation: 'spin 12s linear infinite' }}
                />

                {/* Icon container */}
                <div className="relative size-28 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <BookX className="size-12 text-destructive/70" strokeWidth={1.5} />

                    {/* Small orbiting dot */}
                    <div
                        className="absolute size-2.5 rounded-full bg-destructive/50 top-1 right-3"
                        style={{ animation: 'orbit 4s linear infinite' }}
                    />
                </div>
            </div>

            {/* 404 Badge */}
            <div className="mb-4 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono tracking-widest uppercase">
                Error 404
            </div>

            {/* Text */}
            <h1 className="text-3xl font-semibold text-text text-center mb-3 tracking-tight">
                {title}
            </h1>
            <p className="text-text-muted text-center text-sm max-w-sm leading-relaxed mb-8">
                {description}
            </p>

            {/* Decorative dots row */}
            <div className="flex items-center gap-1.5 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full bg-border"
                        style={{
                            width: i === 2 ? 8 : i === 1 || i === 3 ? 5 : 3,
                            height: i === 2 ? 8 : i === 1 || i === 3 ? 5 : 3,
                            opacity: i === 2 ? 1 : i === 1 || i === 3 ? 0.6 : 0.3
                        }}
                    />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                {showBack && (
                    <Button
                        variant="outline"
                        className="gap-2 border-border bg-input cursor-pointer"
                        onClick={() => backUrl ? router.push(backUrl) : router.back()}
                    >
                        <ArrowLeft className="size-4" />
                        Go Back
                    </Button>
                )}
                {showSearch && communitySlug && (
                    <Button
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push(`/${communitySlug}/courses`)}
                    >
                        <Search className="size-4" />
                        Browse Courses
                    </Button>
                )}
            </div>

            {/* CSS for orbit animation */}
            <style>{`
                @keyframes orbit {
                    from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
                }
            `}</style>
        </div>
    )
}