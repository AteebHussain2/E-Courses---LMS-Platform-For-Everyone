import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type EditButtonProps = {
    text?: string
    courseId: string
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
}

export const CourseEditButton = ({ courseId, className, side, disabled = false, text, tooltip }: EditButtonProps) => {
    return (
        <Tooltip disableHoverableContent={!tooltip}>
            <TooltipTrigger asChild>
                <Button
                    size='icon'
                    className={cn("cursor-pointer rounded-full bg-glass-bg text-secondary hover:bg-[#ffffff]/10 transition-colors", className)}
                    asChild
                    disabled={disabled}
                >
                    <Link href={!disabled ? `courses/edit?courseId=${courseId}` : ''}>
                        <Edit2 className="size-4" />{text}
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                <p>Edit Course</p>
            </TooltipContent>
        </Tooltip>
    )
}