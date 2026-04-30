"use client"

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    lessonId: string
    isComplete: boolean
    onToggle: (lessonId: string) => void
    isPending?: boolean
    className?: string
}

export default function LessonCompleteButton({
    lessonId, isComplete, onToggle, isPending = false, className
}: Props) {
    return (
        <Button
            variant="outline"
            onClick={() => onToggle(lessonId)}
            disabled={isPending}
            className={cn(
                "gap-2 cursor-pointer border-border transition-all",
                isComplete
                    ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/40"
                    : "bg-input hover:bg-muted text-muted-foreground hover:text-foreground",
                className
            )}
        >
            {isPending ? (
                <Loader2 className="size-4 animate-spin" />
            ) : isComplete ? (
                <CheckCircle2 className="size-4" />
            ) : (
                <Circle className="size-4" />
            )}
            {isComplete ? "Completed" : "Mark Complete"}
        </Button>
    )
}