"use client";

import { enrollCourseAction } from "@/actions/enrollments";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils"
import { toast } from "sonner";

type EnrollButtonProps = {
    courseId: string
    communitySlug: string
    isFree: boolean
    className?: string,
    disabled?: boolean,
    setEnrolled: (v: boolean) => void,
}

const CourseEnrollButton = ({ isFree, courseId, communitySlug, className, disabled = false, setEnrolled }: EnrollButtonProps) => {
    const { user } = useUser()

    const mutation = useMutation({
        mutationFn: () => {
            if (!user) throw new Error("Sign in to enroll")
            return enrollCourseAction(user.id, courseId, communitySlug)
        },
        onSuccess: () => {
            setEnrolled(true)
            toast.success("You're enrolled! Welcome to the course.")
        },
        onError: (e) => toast.error(e.message)
    })

    return (
        <Button
            variant='default'
            className={cn("flex-1 w-full cursor-pointer rounded-full bg-primary text-foreground hover:border-border hover:bg-primary/85 hover:text-foreground", className)}
            disabled={mutation.isPending || !user || disabled}
            onClick={() => mutation.mutate()}
        >
            {mutation.isPending
                ? <><Loader2 className="size-3.5 animate-spin" /> Enrolling...</>
                : <><BookOpen className="size-3.5" /> {isFree ? "Enroll Free" : "Enroll Now"}</>
            }
        </Button>
    )
}

export default CourseEnrollButton
