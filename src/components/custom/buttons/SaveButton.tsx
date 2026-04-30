"use client";

import { checkCourseSavedAction, checkSessionSavedAction, toggleSaveAction } from "@/actions/library";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SaveButtonProps = {
    isSession: boolean,
    courseId?: string,
    sessionId?: string,
    communitySlug: string
}

const SaveButton = ({ isSession, courseId, sessionId, communitySlug }: SaveButtonProps) => {
    const { user } = useUser()
    const queryClient = useQueryClient()

    const queryKey = ['saved', courseId ?? sessionId, user?.id]

    // Fetch current saved state
    const { data: isSaved = false, isLoading: isChecking } = useQuery({
        queryKey,
        queryFn: () => {
            if (!user) return Promise.resolve(false)
            if (isSession && sessionId) {
                return checkSessionSavedAction(user.id, sessionId, communitySlug)
            } else if (courseId) {
                return checkCourseSavedAction(user.id, courseId, communitySlug)
            } else {
                return Promise.resolve(false)
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    })

    const mutation = useMutation({
        mutationFn: () => {
            if (!user) throw new Error("Sign in to save courses")
            if (isSession && sessionId) {
                return toggleSaveAction(user.id, sessionId, communitySlug)
            } else if (courseId) {
                return toggleSaveAction(user.id, courseId, communitySlug)
            } else {
                return Promise.reject(new Error("Missing course or session ID"))
            }
        },
        // Optimistic update — flips instantly, reverts on error
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey })
            const prev = queryClient.getQueryData<boolean>(queryKey)
            queryClient.setQueryData(queryKey, (old: boolean) => !old)
            return { prev }
        },
        onSuccess: ({ saved }) => {
            queryClient.setQueryData(queryKey, saved)
            // Also invalidate the library list so /library page stays fresh
            queryClient.invalidateQueries({ queryKey: ['library', courseId ?? sessionId, user?.id] })
        },
        onError: (error, _vars, ctx) => {
            // Revert optimistic update
            queryClient.setQueryData(queryKey, ctx?.prev)
            toast.error(error.message)
        },
    })

    return (
        <Button
            variant='ghost'
            className={cn(
                "h-full w-full inline-flex flex-1 items-center gap-2 px-4 py-3 rounded-full text-sm font-medium cursor-pointer",
                isSaved && "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10! hover:text-primary",
            )}
            disabled={!user || isChecking || mutation.isPending}
            onClick={() => mutation.mutate()}
        >
            {isSaved ? (
                <>
                    <BookmarkCheck className="size-4" />
                    Saved in Library
                </>
            ) : (
                <>
                    <Bookmark className="size-4" />
                    Save in Library
                </>
            )}
        </Button>
    )
}

export default SaveButton
