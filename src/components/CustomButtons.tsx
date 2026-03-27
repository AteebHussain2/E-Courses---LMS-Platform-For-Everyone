"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { AlertTriangleIcon, Edit2, Plus, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

type ButtonProps = {
    courseId?: string,
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    slug?: string,
    disabled?: boolean,
}

export const DeleteCourseButton = ({ courseId, className, side, disabled = false }: ButtonProps) => {
    const mutation = useMutation({
        mutationFn: async (courseId: string) => console.log("TODO: ", courseId),
        onSuccess: () => toast.success("Deleted course successfully!"),
        onError: () => toast.error("Something went wrong! Couldn't delete course."),
    })

    return (
        <Tooltip>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button
                            size='icon'
                            variant='destructive'
                            className={cn("cursor-pointer rounded-full p-0! transition-colors", className)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </TooltipTrigger>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader className='space-y-4'>
                        <AlertDialogTitle className='flex items-center gap-3 text-destructive'>
                            <AlertTriangleIcon />
                            <h1>Dangerous Actions</h1>
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to delete this course?<br />
                            <span className='text-foreground'>Deleted courses can be recovered within 48 hours of deletion</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant='destructive'
                            className={cn("cursor-pointer")}
                            disabled={disabled || mutation.isPending || !courseId}
                            onClick={() => {
                                if (courseId) mutation.mutate(courseId)
                                else toast.error('Something went wrong!')
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TooltipContent side={side}>
                <p>Delete Course</p>
            </TooltipContent>
        </Tooltip>
    )
}

export const EditCourseButton = ({ courseId, className, side, disabled = false }: ButtonProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size='icon'
                    className={cn("cursor-pointer rounded-full bg-glass-bg text-secondary hover:bg-[#ffffff]/10 transition-colors", className)}
                    asChild
                    disabled={disabled}
                >
                    <Link href={!disabled ? `courses/edit?courseId=${courseId}` : ''}>
                        <Edit2 className="size-4" />
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                <p>Edit Course</p>
            </TooltipContent>
        </Tooltip>
    )
}

export const ManageCourseButton = ({ courseId, className, disabled = false }: ButtonProps) => {
    return (
        <Button
            size='lg'
            className={cn("w-full cursor-pointer rounded-full bg-[#0C1321] text-foreground hover:bg-[#0F1A2E] hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link href={!disabled ? `courses/${courseId}` : ''} className='w-full h-full items-center justify-center flex'>
                Manage Course
            </Link>
        </Button>
    )
}

export const AddCourseButton = ({ className, disabled = false }: ButtonProps) => {
    return (
        <Button
            size='lg'
            className={cn("w-full cursor-pointer rounded-full text-foreground hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link href="courses/add" className='w-full h-full items-center justify-center flex gap-2'>
                <Plus /> Add Course
            </Link>
        </Button>
    )
}