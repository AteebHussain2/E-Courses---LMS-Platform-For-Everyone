"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangleIcon, Trash2 } from 'lucide-react';
import { deleteCourseAction } from '@/actions/courses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DeleteButtonProps = {
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
    communitySlug: string
    courseSlug: string
    courseId: string
}

export const DeleteCourseButton = ({ communitySlug, courseSlug, courseId, className, side, disabled = false }: DeleteButtonProps) => {
    const [confirmation, setConfirmation] = useState('')
    const isConfirmed = confirmation === courseSlug

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: (courseId: string) => deleteCourseAction(courseId, communitySlug),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['courses', communitySlug] })
            toast.success("Deleted course successfully!", { id: `course-delete-${courseId}` })
        },
        onError: (error) => toast.error(error.message, { id: `course-delete-${courseId}` })
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
                    <p>Delete Course</p>
                </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader className='space-y-4'>
                    <AlertDialogTitle className='flex items-center gap-3 text-destructive'>
                        <AlertTriangleIcon />
                        Dangerous Actions
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to delete this course?<br />
                        <span className='text-foreground'>Deleted courses can be recovered within 48 hours of deletion</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <p className="text-sm text-muted">
                        Type <span className="text-foreground font-medium">{courseSlug}</span> to confirm deletion:
                    </p>
                    <Input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder={courseSlug}
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
                            toast.loading("Deleting course...", { id: `course-delete-${courseId}` })
                            mutation.mutate(courseId)
                        }}
                    >
                        Delete Course
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}