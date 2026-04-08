"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSessionAction } from "@/actions/sessions";
import { AlertTriangleIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DeleteButtonProps = {
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
    communitySlug: string
    sessionSlug: string
    sessionId: string
}

export const DeleteSessionButton = ({ communitySlug, sessionSlug, sessionId, className, side, disabled = false }: DeleteButtonProps) => {
    const [confirmation, setConfirmation] = useState('')
    const isConfirmed = confirmation === sessionSlug

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: () => deleteSessionAction(sessionId, communitySlug),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['sessions', communitySlug] })
            toast.success("Deleted session successfully!", { id: `session-delete-${sessionId}` })
        },
        onError: (error) => toast.error(error.message, { id: `session-delete-${sessionId}` })
    })

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            size='icon'
                            variant='destructive'
                            className={cn("cursor-pointer rounded-full p-0! transition-colors", className)}
                            disabled={disabled || mutation.isPending}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>

                <TooltipContent side={side}>
                    <p>Delete Session</p>
                </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader className='space-y-4'>
                    <AlertDialogTitle className='flex items-center gap-3 text-destructive'>
                        <AlertTriangleIcon />
                        Dangerous Actions
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to delete this session?<br />
                        <span className='text-foreground'>Deleted sessions can be recovered within 48 hours of deletion</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <p className="text-sm text-muted">
                        Type <span className="text-foreground font-medium">{sessionSlug}</span> to confirm deletion:
                    </p>
                    <Input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder={sessionSlug}
                        className="bg-input border-border"
                    // onPaste={(e) => e.preventDefault()}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        className='cursor-pointer'
                        onClick={() => setConfirmation('')}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant='destructive'
                        className={cn("cursor-pointer")}
                        disabled={disabled || mutation.isPending || !isConfirmed}
                        onClick={() => {
                            toast.loading("Deleting session...", { id: `session-delete-${sessionId}` })
                            mutation.mutate()
                        }}
                    >
                        Delete Session
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}