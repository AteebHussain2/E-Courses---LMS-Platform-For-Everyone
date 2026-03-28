"use client";

import { Dialog, DialogTrigger } from "../ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type CreateLessonButtonProps = {
    className?: string,
    communitySlug: string,
    courseId: string,
}

const CreateLessonButton = ({ courseId, communitySlug, className }: CreateLessonButtonProps) => {
    const mutation = useMutation({
        mutationFn: async () => console.log("TODO: ", courseId, communitySlug),
        onSuccess: () => toast.success("Lesson added successfully!"),
        onError: () => toast.success("Something went wrong!"),
    })
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant='default'
                    className={cn("text-foreground", className)}
                    onClick={() => {
                        mutation.mutate()
                    }}
                >
                    <Plus /> New Lesson
                </Button>
            </DialogTrigger>
        </Dialog>
    )
}

export default CreateLessonButton
