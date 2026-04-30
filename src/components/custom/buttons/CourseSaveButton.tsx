"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkCourseSavedAction, toggleSaveAction } from "@/actions/library";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SaveButtonProps = {
    text?: string
    communitySlug: string
    courseId: string
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
}

export const CourseSaveButton = ({ communitySlug, courseId, className, side, disabled = false, text, tooltip }: SaveButtonProps) => {
    const { user } = useUser()
    const queryClient = useQueryClient()

    const queryKey = ['saved', courseId, user?.id]

    // Fetch current saved state
    const { data: isSaved = false, isLoading: isChecking } = useQuery({
        queryKey,
        queryFn: () =>
            user ? checkCourseSavedAction(user.id, courseId, communitySlug) : Promise.resolve(false),
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    })

    const mutation = useMutation({
        mutationFn: () => {
            if (!user) throw new Error("Sign in to save courses")
            return toggleSaveAction(user.id, courseId, communitySlug)
        },
        // Optimistic update — flips instantly, reverts on error
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey })
            const prev = queryClient.getQueryData<boolean>(queryKey)
            queryClient.setQueryData(queryKey, (old: boolean) => !old)
            return { prev }
        },
        onSuccess: ({ saved }) => {
            queryClient.setQueryData(queryKey, saved) // Also invalidate the library list so /library page stays fresh
            queryClient.invalidateQueries({ queryKey: ['library', courseId, user?.id] })
        },
        onError: (error, _vars, ctx) => {
            // Revert optimistic update
            queryClient.setQueryData(queryKey, ctx?.prev)
            toast.error(error.message)
        },
    })

    return (
        <Tooltip disableHoverableContent={!tooltip}>
            <TooltipTrigger asChild>
                <Button
                    size='icon'
                    className={cn(
                        "shrink-0 cursor-pointer rounded-full bg-glass-bg text-secondary hover:bg-[#ffffff]/10 transition-colors",
                        isSaved && "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
                        className
                    )}
                    disabled={disabled || !user || isChecking || mutation.isPending}
                    aria-label={isSaved ? "Remove from library" : "Save to library"}
                    onClick={() => mutation.mutate()}
                >
                    {isChecking ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : isSaved ? (
                        <BookmarkCheck className="size-4" />
                    ) : (
                        <Bookmark className="size-4 text-muted-foreground" />
                    )}
                    {text}
                </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                {!user
                    ? "Sign in to save"
                    : isSaved
                        ? "Remove from library"
                        : "Save to library"
                }
            </TooltipContent>
        </Tooltip>
    )
}